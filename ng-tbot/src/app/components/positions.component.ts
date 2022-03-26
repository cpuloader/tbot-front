import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Position, PositionsWrapper } from '../objects/objects';
import { UsersService } from '../services/users.service';
import { DialogConfirmComponent } from './dialog-confirm.component';

@Component({
    selector: 'positions',
    templateUrl: './positions.component.html',
    styleUrls: ['/positions.component.scss']
    //changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsComponent implements OnInit, OnDestroy {
    positions: Position[] = [];
    isReady: boolean = false;
    isClosing: boolean = false;
    displayedColumns: string[] = ['account', 'pair_type', 'positionAmt', 'entryPrice',
                        'marketPrice', 'liquidationPrice', 'unrealizedProfit', 'close'];

    dialog: MatDialogRef<any> | null = null;

    private _posSub$: Subscription | null = null;
    private _httpSub$: Subscription | null = null;

    constructor(private usersService: UsersService,
                private vcr: ViewContainerRef,
                private mdDialog: MatDialog) {
    }

    getPositions() {
        if (this._httpSub$) this._httpSub$.unsubscribe();
        this._httpSub$ = this.usersService.getPositions().subscribe(
            res => {
                this.positions = res.positions.filter(pos => { return pos.positionAmt != 0 });
                this.sortPositions();
                this.isReady = true;
            },
            err => {
                console.log(err.error);
                this.isReady = true;
            }
        );
    }

    addPositions(poss: PositionsWrapper) {
        // incoming positions are for one account and margin type only, so do these things
        poss.positions = poss.positions.filter(pos => { return pos.positionAmt != 0 }); // clear empty
        this.positions = this.positions.filter(pos =>
            { return pos.bacc_id !== poss.bacc_id || pos.pair_type.is_coin !== poss.is_coin }); // clear all previous for this acc or other margin type
        this.positions = this.positions.concat(poss.positions);
        this.sortPositions();
    }

    closePosition(position: Position) {
      this.openConfirmDialog(`Close position ${position.symbol}?`, 'OK').then(confirmed => {
          if (!confirmed) return;
          this.close(position);
      });
    }

    openConfirmDialog(dialogText: string, action: string): Promise<any> {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.viewContainerRef = this.vcr;
        this.dialog = this.mdDialog.open(DialogConfirmComponent, dialogConfig);
        this.dialog.componentInstance.dialogText = dialogText;
        this.dialog.componentInstance.action = action;
        return new Promise((resolve, reject) => {
            this.dialog?.afterClosed().subscribe(result => {
                this.dialog = null;
                resolve(result);
            });
        });
    }

    close(position: Position) {
        if (this.isClosing) return;
        if (this._httpSub$) this._httpSub$.unsubscribe();
        const symbols = position.pair_type.name.split(" / ");
        this._httpSub$ = this.usersService.closePosition(
            position.bacc_id, symbols[0], symbols[1], position.pair_type.is_coin).subscribe(
                () => {
                    this.isClosing = false;
                },
                err => {
                    this.isClosing = false;
                    console.log(err.error);
                }
        );
    }

    sortPositions() {
        this.positions.sort((a, b) => { return a.bacc_id - b.bacc_id });
        this.positions.sort((a, b) => {
            let x = a.symbol.toLowerCase();
            let y = b.symbol.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        });
    }

    subscribeToPositions() {
        this._posSub$ = this.usersService.positions$.subscribe(
            (res : PositionsWrapper | null) => {
                if (res) this.addPositions(res);
            }
        );
    }

    ngOnInit() {
        this.subscribeToPositions();
        this.getPositions();
    }

    ngOnDestroy() {
        if (this._posSub$) this._posSub$.unsubscribe();
        if (this._httpSub$) this._httpSub$.unsubscribe();
    }
}
