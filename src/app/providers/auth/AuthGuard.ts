import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { Router } from "@angular/router";

// Admin Routes Auth Guard
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  AdminData: any = {};
  constructor(private router: Router) {}
  canActivate():any {
    if (this.IsLoggedIn()) {
      return true;
    } else {
      this.router.navigate(["login"]);
    }
  }
  checkPermission(itemGuid: string, accessItem: string) {

    try {
      const permissionArr = JSON.parse(localStorage.getItem("user_menu_list"));
      let item = permissionArr.find(
        (item: object) => item["MENU_GUID"] === itemGuid
      );
      if (item && accessItem) {
        switch (accessItem) {
          case "view":
            return item["VIEW_ACCESS"];
          case "create":
            return item["ADD_ACCESS"];
          case "edit":
            return item["EDIT_ACCESS"];
          case "delete":
            return item["DELETE_ACCESS"];
          case "export":
            return item["EXPORT_ACCESS"];
          case "visible":
            return item["Hide_From_Menu"];
          case "visible-menu":
            return item["MENU_ACCESS"];
          case "approve":
            return item["APPROVE_ACCESS"];
          case "verify":
            return item["VERIFY_ACCESS"];
          default:
            return false;
        }
      }
    } catch (error) {
      console.log("erorr in checking permission", error);
    }
    return false;
  }
  IsLoggedIn() {
    this.AdminData = localStorage.getItem("AdminData");
    if (this.AdminData) {
      return true;
    } else {
      return false;
    }
  }

  GetLoginData() {
    if (this.IsLoggedIn()) {
      return this.AdminData;
    } else {
      return false;
    }
  }
}

// Login Auth Guard
@Injectable()
export class LoginAuthGuard implements CanActivate {
  AdminData: any = {};
  constructor(private router: Router) {}

  canActivate():any {
    if (this.IsLoggedIn()) {
      this.router.navigate(["/dashboard"]);
    } else {
      return true;
    }
  }

  IsLoggedIn() {
    this.AdminData = localStorage.getItem("AdminData");
    if (this.AdminData) {
      return true;
    } else {
      return false;
    }
  }
}
