import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatAccordion } from '@angular/material/expansion';

@Component({
    selector: 'settings-page',
    templateUrl: './settings.page.html',
    styleUrls: ['/settings.page.scss']
})
export class SettingsPage implements AfterViewInit, OnDestroy {

    @ViewChild(MatAccordion) accordion: MatAccordion;

    constructor() {}

    ngAfterViewInit() {
        // setTimeout to prevent 'Expression has changed after it was checked'
        setTimeout(() => { this.accordion.openAll(); });
    }

    ngOnDestroy() {}
}
