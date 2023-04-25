import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SidenavService } from "../sidenav.service";
import { SidenavItem } from "./sidenav-item.interface";
import isFunction from "lodash-es/isFunction";

import { ShareDataService } from "../../../providers/services/SharedService";

@Component({
  selector: "fury-sidenav-item",
  templateUrl: "./sidenav-item.component.html",
  styleUrls: ["./sidenav-item.component.scss"],
  animations: [
    trigger("dropdownOpen", [
      state(
        "false",
        style({
          height: 0,
        })
      ),
      state(
        "true",
        style({
          height: "*",
        })
      ),
      transition(
        "false <=> true",
        animate("300ms cubic-bezier(.35, 0, .25, 1)")
      ),
    ]),
  ],
})
export class SidenavItemComponent implements OnInit {
  @Input("item") item: SidenavItem;
  @Input("level") level: number;

  isCollapsed$ = this.sidenavService.collapsed$;
  dropdownOpen$: Observable<boolean>;

  constructor(
    private sidenavService: SidenavService,
    private router: Router,
    public share: ShareDataService
  ) {
    this.dropdownOpen$ = this.sidenavService.currentlyOpen$.pipe(
      map((currentlyOpen) => {
        return (
          this.item.subItems &&
          this.item.subItems.length > 0 &&
          currentlyOpen.indexOf(this.item) > -1
        );
      })
    );
  }

  get levelClass() {
    return `level-${this.level}`;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.router.url == "/users/view/all") {
      this.dropdownOpen$.pipe((res) => {
        return res;
      });
    }
    this.isCollapsed$.subscribe((res) => {
      // console.log(res);
    });
  }

  isFunction(routeOrFunction: string[] | Function) {
    return isFunction(routeOrFunction);
  }

  handleClick() {
    if (this.item.subItems && this.item.subItems.length > 0) {
      this.sidenavService.toggleItemOpen(this.item);
    } else if (
      typeof this.item.routeOrFunction === "string" ||
      this.item.routeOrFunction instanceof String
    ) {
      this.router.navigate([this.item.routeOrFunction]);
    } else if (
      typeof this.item.routeOrFunction === "function" ||
      this.item.routeOrFunction instanceof Function
    ) {
      this.item.routeOrFunction();
    } else {
      throw Error(
        "Could not determine what to do, Sidenav-Item has no routeOrFunction set AND does not contain any subItems"
      );
    }
  }

  getTextIcon(item: SidenavItem) {
    let result = "";

    if (item) {
      const name = item.name.split(" ");

      if (name.length > 0) {
        result += name[0].charAt(0).toUpperCase();
      }

      if (name.length > 1) {
        result += name[1].charAt(0).toLowerCase();
      }

      if (name.length === 1) {
        result += name[0].charAt(1).toLowerCase();
      }
    }

    return result;
  }

  logout(item: any) {
    if (item.name == "Logout") {
      localStorage.removeItem("AdminData");
      localStorage.clear();
      this.router.navigate(["login"]);
    }
  }
}
