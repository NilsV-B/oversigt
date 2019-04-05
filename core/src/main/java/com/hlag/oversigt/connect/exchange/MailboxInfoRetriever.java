package com.hlag.oversigt.connect.exchange;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAmount;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.hlag.oversigt.properties.Credentials;
import com.hlag.oversigt.properties.ServerConnection;

import microsoft.exchange.webservices.data.core.ExchangeService;
import microsoft.exchange.webservices.data.core.enumeration.misc.ExchangeVersion;
import microsoft.exchange.webservices.data.core.enumeration.property.WellKnownFolderName;
import microsoft.exchange.webservices.data.core.enumeration.search.FolderTraversal;
import microsoft.exchange.webservices.data.core.enumeration.search.SortDirection;
import microsoft.exchange.webservices.data.core.exception.service.local.ServiceLocalException;
import microsoft.exchange.webservices.data.core.service.folder.Folder;
import microsoft.exchange.webservices.data.core.service.item.EmailMessage;
import microsoft.exchange.webservices.data.core.service.item.Item;
import microsoft.exchange.webservices.data.core.service.item.Task;
import microsoft.exchange.webservices.data.core.service.schema.FolderSchema;
import microsoft.exchange.webservices.data.core.service.schema.ItemSchema;
import microsoft.exchange.webservices.data.core.service.schema.TaskSchema;
import microsoft.exchange.webservices.data.credential.ExchangeCredentials;
import microsoft.exchange.webservices.data.credential.WebCredentials;
import microsoft.exchange.webservices.data.property.complex.EmailAddress;
import microsoft.exchange.webservices.data.property.complex.FolderId;
import microsoft.exchange.webservices.data.search.FindFoldersResults;
import microsoft.exchange.webservices.data.search.FindItemsResults;
import microsoft.exchange.webservices.data.search.FolderView;
import microsoft.exchange.webservices.data.search.ItemView;
import microsoft.exchange.webservices.data.search.filter.SearchFilter;

public class MailboxInfoRetriever {
	private static final MailboxInfoRetriever SINGLETON = new MailboxInfoRetriever();

	private final Map<Key, ExchangeService> services = new HashMap<>();

	private final Map<Key, MailboxInfoLoadingProvider> providers = new HashMap<>();

	private final Map<Key, MailboxFolder> mailboxes = new HashMap<>();

	private final Map<Key, List<Task>> tasks = new HashMap<>();

	private final Map<Key, LocalDateTime> lastMailboxLoadingTimes = new HashMap<>();

	private final Map<Key, LocalDateTime> lastTasksLoadingTimes = new HashMap<>();

	public static MailboxInfoRetriever getInstance() {
		return SINGLETON;
	}

	/**
	 * Loads the mailbox folder from the exchange server
	 *
	 * @param mailboxName the name of the mailbox to read
	 * @param folderName  the name of the folder within the mailbox to read
	 * @return the mailbox from the server or <code>null</code> if something fails
	 *         but does not throw an exception
	 * @throws Exception if the underlying exchange service throws an exception
	 */
	public MailboxFolder getMailbox(final String mailboxName, final String folderName) throws Exception {
		final Key key = new Key(mailboxName, folderName);
		if (!mailboxes.containsKey(key) || shouldReload(key)) {
			// XXX Sync?
			mailboxes.put(key, loadMailbox(key));
			lastMailboxLoadingTimes.put(key, LocalDateTime.now());
		}
		return mailboxes.get(key);
	}

	public List<Task> getTasks(final String mailboxName) throws Exception {
		final Key key = new Key(mailboxName, null);
		if (!tasks.containsKey(key) || shouldReloadTasks(key)) {
			// XXX Sync?
			tasks.put(key, loadTasks(key));
			lastTasksLoadingTimes.put(key, LocalDateTime.now());
		}
		return tasks.get(key);
	}

	private List<Task> loadTasks(final Key key) throws Exception {
		final ExchangeService service = getService(key);

		final List<Task> tasks = new ArrayList<>();

		final ItemView view = new ItemView(50);
		view.getOrderBy().add(ItemSchema.DateTimeCreated, SortDirection.Descending);
		final SearchFilter filter = new SearchFilter.IsLessThanOrEqualTo(TaskSchema.StartDate, new Date());
		FindItemsResults<Item> findResults;
		do {
			final FolderId folderId = getUniqueIdForFolderName(service, "Dashboard");
			findResults = service.findItems(folderId, filter, view);
			tasks.addAll(findResults.getItems().stream().filter(i -> i instanceof Task).map(i -> (Task) i).filter(t -> {
				try {
					return !t.getIsComplete();
				} catch (final Exception e) {
					throw new RuntimeException("Unable to read complete status of task", e);
				}
			}).collect(Collectors.toList()));
			view.setOffset(view.getOffset() + 50);
		} while (findResults.isMoreAvailable());

		return tasks;
	}

	private FolderId getUniqueIdForFolderName(final ExchangeService service, final String folderName) throws Exception {
		final FolderView view = new FolderView(1);
		view.setTraversal(FolderTraversal.Deep);
		final SearchFilter searchFilter = new SearchFilter.IsEqualTo(FolderSchema.DisplayName, folderName);
		final FindFoldersResults folders = service.findFolders(WellKnownFolderName.Root, searchFilter, view);
		switch (folders.getTotalCount()) {
		case 0:
			throw new RuntimeException("No folder found with name '" + folderName + "'");
		case 1:
			return folders.getFolders().get(0).getId();
		default:
			throw new RuntimeException("More than one folder with name '" + folderName + "' found");
		}
	}

	private MailboxFolder loadMailbox(final Key key) throws Exception {
		final MailboxFolder mailboxFolder = new MailboxFolder(key.getMailboxName(), key.getFolderName());

		final ExchangeService service = getService(key);
		final FolderId folderId = getFolder(service, key.getFolderName());

		final ItemView view = new ItemView(50);
		view.getOrderBy().add(ItemSchema.DateTimeReceived, SortDirection.Ascending);
		FindItemsResults<Item> findResults;
		do {
			findResults = service.findItems(folderId, view);
			for (final Item item : findResults.getItems()) {
				if (item instanceof EmailMessage) {
					mailboxFolder.addMail(new Mail((EmailMessage) item));
				}

			}
			view.setOffset(view.getOffset() + 50);
		} while (findResults.isMoreAvailable());

		return mailboxFolder;
	}

	private ExchangeService getService(final Key key) {
		if (!services.containsKey(key)) {
			services.put(key, createService(key));
		}
		return services.get(key);
	}

	private ExchangeService createService(final Key key) {
		final MailboxInfoLoadingProvider provider = getProvider(key);
		return createService(provider.getServerConnection().getUrl(),
				provider.getCredentials().getUsername(),
				provider.getCredentials().getPassword());
	}

	public static ExchangeService createService(final String uri, final String username, final String password) {
		try {
			final ExchangeService svc = new ExchangeService(ExchangeVersion.Exchange2010_SP2);
			final ExchangeCredentials credentials = new WebCredentials(username, password);
			svc.setCredentials(credentials);
			svc.setUrl(new URI(uri));
			return svc;
		} catch (final Exception e) {
			throw new RuntimeException("Unable to create Exchange service", e);
		}
	}

	private FolderId getFolder(final ExchangeService service, final String folderName) throws Exception {
		final SearchFilter folderSearchFilter = new SearchFilter.IsEqualTo(FolderSchema.DisplayName, folderName);
		final FolderView folderView = new FolderView(2);
		final FindFoldersResults searchResult
				= service.findFolders(WellKnownFolderName.MsgFolderRoot, folderSearchFilter, folderView);
		final ArrayList<Folder> folders = searchResult.getFolders();
		if (folders.size() == 0) {
			return null;
		} else if (folders.size() > 1) {
			return null;
		} else {
			return folders.get(0).getId();
		}
	}

	private boolean shouldReload(final Key key) {
		final MailboxInfoLoadingProvider provider = getProvider(key);
		final LocalDateTime lastLoadingTime = lastMailboxLoadingTimes.get(key);
		if (lastLoadingTime == null) {
			return true;
		}
		return LocalDateTime.now().minus(provider.getReloadInterval()).isAfter(lastLoadingTime);
	}

	private boolean shouldReloadTasks(final Key key) {
		final MailboxInfoLoadingProvider provider = getProvider(key);
		final LocalDateTime lastLoadingTime = lastTasksLoadingTimes.get(key);
		if (lastLoadingTime == null) {
			return true;
		}
		return LocalDateTime.now().minus(provider.getReloadInterval()).isAfter(lastLoadingTime);
	}

	public void registerProvider(final String mailboxName,
			final String folderName,
			final MailboxInfoLoadingProvider provider) {
		providers.put(new Key(mailboxName, folderName), provider);
	}

	public void removeProvider(final String mailboxName, final String folderName) {
		providers.remove(new Key(mailboxName, folderName));
	}

	private MailboxInfoLoadingProvider getProvider(final Key key) {
		return providers.get(key);
	}

	public static final class MailboxFolder {

		private final String mailboxName;

		private final String folderName;

		private final List<Mail> mails = new ArrayList<>();

		public MailboxFolder(final String mailboxName, final String folderName) {
			this.mailboxName = mailboxName;
			this.folderName = folderName;
		}

		public String getMailboxName() {
			return mailboxName;
		}

		public String getFolderName() {
			return folderName;
		}

		public List<Mail> getMails() {
			return mails;
		}

		public void addMail(final Mail mail) {
			mails.add(mail);
		}
	}

	public static final class Mail {

		private final String id;

		private final String subject;

		private final String fromAddress;

		private final String fromName;

		private final Map<String, String> tos = new HashMap<>();

		private final Map<String, String> ccs = new HashMap<>();

		private final boolean isRead;

		private final boolean hasAttachment;

		private final List<String> categories = new ArrayList<>();

		public Mail(final EmailMessage mail) throws ServiceLocalException {
			id = mail.getId().getUniqueId();
			subject = mail.getSubject();

			final EmailAddress from = mail.getFrom();
			fromAddress = from.getAddress();
			fromName = from.getName();

			final Iterator<EmailAddress> toIter = mail.getToRecipients().iterator();
			while (toIter.hasNext()) {
				final EmailAddress to = toIter.next();
				tos.put(to.getName(), to.getAddress());
			}

			final Iterator<EmailAddress> ccIter = mail.getCcRecipients().iterator();
			while (ccIter.hasNext()) {
				final EmailAddress cc = ccIter.next();
				ccs.put(cc.getName(), cc.getAddress());
			}

			isRead = mail.getIsRead();
			hasAttachment = mail.getHasAttachments();

			final Iterator<String> catIter = mail.getCategories().iterator();
			while (catIter.hasNext()) {
				categories.add(catIter.next());
			}
		}

		public String getId() {
			return id;
		}

		public String getSubject() {
			return subject;
		}

		public String getFromAddress() {
			return fromAddress;
		}

		public String getFromName() {
			return fromName;
		}

		public Map<String, String> getTos() {
			return tos;
		}

		public Map<String, String> getCcs() {
			return ccs;
		}

		public boolean isRead() {
			return isRead;
		}

		public boolean isHasAttachment() {
			return hasAttachment;
		}

		public List<String> getCategories() {
			return categories;
		}
	}

	public interface MailboxInfoLoadingProvider {

		ServerConnection getServerConnection();

		Credentials getCredentials();

		TemporalAmount getReloadInterval();
	}

	private static final class Key {

		private final String mailboxName;

		private final String folderName;

		public Key(final String mailboxName, final String folderName) {
			this.mailboxName = mailboxName;
			this.folderName = folderName;
		}

		public String getMailboxName() {
			return mailboxName;
		}

		public String getFolderName() {
			return folderName;
		}

		@Override
		public int hashCode() {
			final int prime = 31;
			int result = 1;
			result = prime * result + (folderName == null ? 0 : folderName.hashCode());
			result = prime * result + (mailboxName == null ? 0 : mailboxName.hashCode());
			return result;
		}

		@Override
		public boolean equals(final Object obj) {
			if (this == obj) {
				return true;
			}
			if (obj == null) {
				return false;
			}
			if (getClass() != obj.getClass()) {
				return false;
			}
			final Key other = (Key) obj;
			if (folderName == null) {
				if (other.folderName != null) {
					return false;
				}
			} else if (!folderName.equals(other.folderName)) {
				return false;
			}
			if (mailboxName == null) {
				if (other.mailboxName != null) {
					return false;
				}
			} else if (!mailboxName.equals(other.mailboxName)) {
				return false;
			}
			return true;
		}
	}
}
