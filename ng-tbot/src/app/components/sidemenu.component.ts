import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSelectionListChange } from '@angular/material/list';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';

interface ListElement {
    id: number;
    name: string;
    link: string;
    icon: string;
    selected: boolean;
}

@Component({
    selector: 'side-menu',
    templateUrl: './sidemenu.component.html',
    styleUrls: ['/sidemenu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent implements OnInit {

    elements: ListElement[] = [
      { id: 0, name: 'Панель', link: '/home', icon: 'payments', selected: false},
      { id: 1, name: 'Торговые пары', link: '/trade-pairs', icon: 'sync_alt', selected: false},
      { id: 2, name: 'Настройки', link: '/settings', icon: 'settings', selected: false}
    ];
    compareFunction = (o1: any, o2: any) => o1.id === o2.id;

    constructor(private router: Router,
                private location: Location,
                private cdr: ChangeDetectorRef,
                private usersService: UsersService,
                private authService: AuthService) {
    }

    onChange(change: MatSelectionListChange) {
        this.router.navigate([change.option.value.link]).then(() => {});
    }

    selectItem(el: ListElement) {
        this.router.navigate([el.link]).then(() => {});
    }

    checkPath() {
        const path = this.location.path();
        let index = this.elements.findIndex(el => { return el.link === path; });
        if (index > -1) {
            this.elements[index].selected = true;
        } else {
          for (var el of this.elements) {
            el.selected = false;
          }
        }
    }

    ngOnInit() {
        this.checkPath();
    }
}
