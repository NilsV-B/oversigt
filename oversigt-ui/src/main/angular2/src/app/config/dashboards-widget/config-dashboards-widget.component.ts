import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { DashboardWidgetService, WidgetDetails, EventSourceService, EventSourceDescriptor, FullEventSourceInstanceInfo } from 'src/oversigt-client';
import { NotificationService } from 'src/app/notification.service';
import { ClrLoadingState } from '@clr/angular';
import { getLinkForDashboard } from 'src/app/app.component';

@Component({
  selector: 'app-config-dashboard-widget',
  templateUrl: './config-dashboards-widget.component.html',
  styleUrls: ['./config-dashboards-widget.component.css']
})
export class ConfigDashboardWidgetComponent implements OnInit, OnDestroy {
  private subscription: Subscription = null;
  private dashboardId: string = null;
  private widgetId: number = null;
  widget: WidgetDetails = null;
  eventSourceInstanceInfo: FullEventSourceInstanceInfo = null;
  eventSourceDescriptor: EventSourceDescriptor = null;
  widgetSize: number[] = null;
  widgetPosition: number[] = null;

  saveButtonState: ClrLoadingState = ClrLoadingState.DEFAULT;
  deleteButtonState: ClrLoadingState = ClrLoadingState.DEFAULT;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardWidgetService: DashboardWidgetService,
    private eventSourceService: EventSourceService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.subscription = this.route.url.subscribe(_ => {
      this.initComponent();
    });
  }

  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  private initComponent(): void {
    // find selected dashboard and widget id
    this.dashboardId = this.route.snapshot.parent.paramMap.get('dashboardId');
    this.widgetId = +this.route.snapshot.paramMap.get('widgetId');

    this.widget = null; // TODO: show loading
    this.eventSourceDescriptor = null;
    this.dashboardWidgetService.readWidget(this.dashboardId, this.widgetId, true).subscribe(widget => {
      this.setWidgetDetails(widget);
    },
    error => {
      alert(error);
      // TODO: error handling
    });
  }

  private setWidgetDetails(widget: WidgetDetails): void {
    this.widget = widget;
    this.widgetSize = [widget.sizeX, widget.sizeY];
    this.widgetPosition = [widget.posX, widget.posY];
    this.eventSourceService.readInstance(widget.eventSourceInstanceId).subscribe(esi => {
      this.eventSourceInstanceInfo = esi;
      this.eventSourceService.getEventSourceDetails(esi.instanceDetails.eventSourceDescriptor).subscribe(esd => {
        this.eventSourceDescriptor = esd;
      },
      error => {
        console.log(error);
        // TODO: error handling
      });
    },
    error => {
      console.log(error);
      // TODO: error handling
    });
  }

  hasEventSourceProperty(propertyName: string): boolean {
    return this.eventSourceInstanceInfo.instanceDetails.dataItems[propertyName] !== undefined;
  }

  saveWidget(): void {
    this.saveButtonState = ClrLoadingState.LOADING;
    this.widget.posX = this.widgetPosition[0];
    this.widget.posY = this.widgetPosition[1];
    this.widget.sizeX = this.widgetSize[0];
    this.widget.sizeY = this.widgetSize[1];
    this.dashboardWidgetService.updateWidget(this.dashboardId, this.widgetId, this.widget).subscribe(widget => {
      this.setWidgetDetails(widget);
      this.notificationService.success('Widget ' + this.widget.name + ' has been saved.');
      this.saveButtonState = ClrLoadingState.SUCCESS;
      // TODO: update parent component (list of widgets on dashboard)
    },
    error => {
      console.log(error);
      // TODO: error handling
      this.saveButtonState = ClrLoadingState.ERROR;
    });
  }

  deleteWidget(): void {
    if (!confirm('Do you really want to delete this widget?')) {
      return;
    }

    this.deleteButtonState = ClrLoadingState.LOADING;
    this.dashboardWidgetService.deleteWidget(this.dashboardId, this.widgetId).subscribe(ok => {
      console.log(ok);
      this.notificationService.success('The widget has been deleted.');
      this.deleteButtonState = ClrLoadingState.SUCCESS;
      this.router.navigateByUrl(getLinkForDashboard(this.dashboardId));
      // TODO: refresh dashboard mini map
    }, error => {
      // TODO: error handling
      this.notificationService.error(error.message);
      console.log(error);
      this.deleteButtonState = ClrLoadingState.ERROR;
    });
  }
}
