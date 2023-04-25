import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { map, filter } from "rxjs/operators";
import { ThemeService } from "../../../@fury/services/theme.service";
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RoutesRecognized,
  ActivationStart,
} from "@angular/router";
import { SidenavService } from "../sidenav/sidenav.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "fury-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent implements OnInit {
  @Input()
  @HostBinding("class.no-box-shadow")
  hasNavigation: boolean;

  @Output() openSidenav = new EventEmitter();
  @Output() openQuickPanel = new EventEmitter();

  topNavigation$ = this.themeService.config$.pipe(
    map((config) => config.navigation === "top")
  );
  routeTitle: string = "";
  startEvent = null;
  constructor(
    private themeService: ThemeService,
    private router: Router,
    private sidenavService: SidenavService,
    private titleService: Title
  ) {}
  toggleCollapsed() {
    this.sidenavService.toggleCollapsed();
  }
  ngOnInit() {
    if (!this.startEvent) {
      this.startEvent = this.router.events.subscribe((data) => {
        if (data instanceof ActivationStart) {
          this.routeTitle = data.snapshot.data["title"];
          if (data.snapshot.data["title"]) {
            this.titleService.setTitle(data.snapshot.data["title"]);
          }
        }
      });
    }
    this.routeTitle = this.titleService.getTitle();
  }
}
