import { Component, OnInit, OnDestroy, ViewChild, ComponentRef } from '@angular/core';
import { DashboardService, Dashboard, DashboardWidgetService, WidgetInfo, SystemService } from 'src/oversigt-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ClrLoadingState } from '@clr/angular';
import { getLinkForDashboards } from 'src/app/app.component';
import { NotificationService } from 'src/app/notification.service';
import { ConfigDashboardWidgetComponent } from '../dashboards-widget/config-dashboards-widget.component';

@Component({
  selector: 'app-config-dashboards-edit',
  templateUrl: './config-dashboards-edit.component.html',
  styleUrls: ['./config-dashboards-edit.component.scss']
})
export class ConfigDashboardsEditComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private childSubscription: Subscription = null;

  private dashboardId: string = null;
  dashboardTitle = '';
  dashboard: Dashboard = null;
  screensize: number[] = [];
  foregroundColors: string[] = [];
  owners: string[] = [];
  editors: string[] = [];
  widgetInfos: WidgetInfo[] = [];

  // Loading indicator
  saveDashboardState: ClrLoadingState = ClrLoadingState.DEFAULT;
  deleteDashboardState: ClrLoadingState = ClrLoadingState.DEFAULT;
  enableDashboardState: ClrLoadingState = ClrLoadingState.DEFAULT;

  // for chip editor
  syncUserIdValidators = [];
  asyncUserIdValidators = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private dashboardWidgetService: DashboardWidgetService,
    private systemService: SystemService,
    private notification: NotificationService,
  ) {
    const isUserIdValid = (control: FormControl) => {
      return new Promise(resolve => {
        const userid = control.value;
        this.systemService.isUserValid(userid).subscribe(valid => {
          resolve(valid);
        },
        error => {
          resolve(false);
        });
      });
    };
    this.asyncUserIdValidators = [isUserIdValid];
    this.syncUserIdValidators = [(control: FormControl) => control.value.length > 0];
  }

  ngOnInit() {
    this.subscriptions.push(this.route.url.subscribe(_ => {
      this.initComponent();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.childSubscription) {
      this.childSubscription.unsubscribe();
    }
  }

  activateChild(componentRef: ComponentRef<any>): void {
    if (this.childSubscription) {
      this.childSubscription.unsubscribe();
    }
    if (componentRef instanceof ConfigDashboardWidgetComponent) {
      const child: ConfigDashboardWidgetComponent = componentRef;
      this.childSubscription = child.positionChanged.subscribe(event => {
        this.loadWidgetPositions();
      });
    }
  }

  isAddingWidget(): boolean {
    if (this.route.snapshot.children && this.route.snapshot.children[0]) {
      const last = this.route.snapshot.children[0].url.map(s => s.path)[0];
      return last === 'add';
    }
    return false;
  }

  private initComponent(): void {
    // find selected dashboard id
    this.dashboardId = this.route.snapshot.paramMap.get('dashboardId');

    this.dashboardService.readDashboard(this.dashboardId).subscribe(dashboard => {
      this.setDashboard(dashboard);
      // TODO: Error handling
    });
    this.loadWidgetPositions();
  }

  private loadWidgetPositions(): void {
    this.dashboardWidgetService.listWidgets(this.dashboardId).subscribe(widgetInfos => {
      this.widgetInfos = widgetInfos;
      // TODO: Error handling
    });
  }

  private setDashboard(dashboard: Dashboard, withRights: boolean = false): void {
    this.dashboard = dashboard;
    this.dashboardTitle = dashboard.title;
    this.foregroundColors = [dashboard.foregroundColorStart, dashboard.foregroundColorEnd];
    this.screensize = [dashboard.screenWidth, dashboard.screenHeight];
    if (withRights) {
      this.owners = dashboard.owners;
      this.editors = dashboard.editors;
    }
  }

  saveDashboardSettings(): void {
    this.saveDashboardState = ClrLoadingState.LOADING;
    this.dashboard.foregroundColorStart = this.foregroundColors[0];
    this.dashboard.foregroundColorEnd   = this.foregroundColors[1];
    this.dashboard.screenWidth  = this.screensize[0];
    this.dashboard.screenHeight = this.screensize[1];
    this.dashboardService.updateDashboard(this.dashboardId, this.dashboard).subscribe(dashboard => {
      this.setDashboard(dashboard);
      this.saveDashboardState = ClrLoadingState.SUCCESS;
      this.notification.success('The dashboard configuration has been saved.');
    },
    error => {
      this.saveDashboardState = ClrLoadingState.ERROR;
      // TODO: Error handling
      alert(error);
      console.log(error);
    });
  }

  deleteDashboard(): void {
    if (!confirm('Do you really want to delete this dashboard?')) {
      return;
    }

    this.dashboardService.deleteDashboard(this.dashboardId).subscribe(ok => {
      this.deleteDashboardState = ClrLoadingState.SUCCESS;
      this.notification.success('The dashboard "' + this.dashboard.title + '"has been deleted.');
      this.router.navigateByUrl(getLinkForDashboards());
    }, error => {
      this.deleteDashboardState = ClrLoadingState.ERROR;
      console.log(error);
      alert(error);
      // TODO: error handling
    });
  }

  enableDashboard(enabled: boolean): void {
    this.enableDashboardState = ClrLoadingState.LOADING;
    this.dashboardService.readDashboard(this.dashboardId).subscribe(
      dashboard => {
        dashboard.enabled = enabled;
        this.dashboardService.updateDashboard(this.dashboardId, dashboard).subscribe(
          ok => {
            this.enableDashboardState = ClrLoadingState.SUCCESS;
            if (enabled) {
              this.notification.success('The dashboard "' + dashboard.title + '" has been enabled.');
            } else {
              this.notification.success('The dashboard "' + dashboard.title + '" has been disabled.');
            }
            this.dashboard.enabled = ok.enabled;
          }, error => {
            // TODO: error handling
            alert(error);
            console.log(error);
            this.enableDashboardState = ClrLoadingState.ERROR;
            this.notification.error('Error while changing dashboard enabled state.');
          }
        );
      }, error => {
        // TODO: error handling
        alert(error);
        console.log(error);
        this.enableDashboardState = ClrLoadingState.ERROR;
        this.notification.error('Error while changing dashboard enabled state.');
      }
    );
  }

  countColumns(): number {
    return Math.max(this.dashboard.columns, Math.max(...this.widgetInfos.map(i => i.posX + i.sizeX)) - 1);
  }

  countRows(): number {
    return Math.max(...this.widgetInfos.map(i => i.posY + i.sizeY)) - 1;
  }
}
