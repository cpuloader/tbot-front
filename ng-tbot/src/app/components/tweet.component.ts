import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tweet } from '../objects/objects';
import { UsersService } from '../services/users.service';


@Component({
    selector: 'tweet-comp',
    templateUrl: './tweet.component.html',
    styleUrls: ['/tweet.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TweetComponent {
    @Input()tweet: Tweet;

    showTweet: boolean = false;

    constructor(private usersService: UsersService) {
    }

    toggleShow() {
        this.showTweet = !this.showTweet;
    }

}
