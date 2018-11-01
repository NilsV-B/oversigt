import { Pipe, PipeTransform } from '@angular/core';
import { UserServiceService } from './user-service.service';

@Pipe({
  name: 'filterForRole'
})
export class FilterForRolePipe implements PipeTransform {

  constructor(
    private userService: UserServiceService,
  ) { }

  transform(items: any[]): any[] {
    if (!items) {
      return [];
    }
    /*if (!searchText) {
      return items;
    }*/

    return items.filter(item => this.isItemAllowed(item));

    /*searchText = searchText.toLowerCase();

    return items.filter( it => {
      if (it['event'] !== undefined) {
        return JSON.stringify(it.event).toLowerCase().includes(searchText);
      } else {
        return JSON.stringify(it).toLowerCase().includes(searchText);
      }
    });*/
  }

  private isItemAllowed(item: any): boolean {
    const requiredRole: string = item.requiredRole;
    if (requiredRole === undefined || requiredRole === null) {
      return true;
    }

    return this.userService.hasRole(requiredRole);
  }
}
