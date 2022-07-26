import { Component, OnInit } from "@angular/core";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { MsalService } from "@azure/msal-angular";
import { Subject } from "rxjs";
import { currentEnv, currentEnvName, urlNav, b2c } from "app/URL";

@Component({
  selector: 'app-login-celcom',
  templateUrl: './login-celcom.component.html',
  styleUrls: ['./login-celcom.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(500)
      ]),
    ])
  ]
})

export class LoginCelcomComponent implements OnInit {
  register: boolean = false;
  login: boolean = true;
  loginButtonDisabled: boolean = true;

  loginForm: FormGroup = this.builder.group({
    username: [, { updateOn: "change"}],
    password: [, { updateOn: "change"}],
    rememberMe: [false, { updateOn: "change"}]
  })

  constructor(
    private msalService: MsalService,
    private builder: FormBuilder,
    private router: Router,
    private http: HttpClient) {}

  ngOnInit(): void {
    this.loginFormValidation();
  }

  loginFormValidation() {
    this.loginForm.valueChanges.subscribe(data => {
      if (data.username == '' || data.password == '') {
        this.loginButtonDisabled = true;
      } else {
        this.loginButtonDisabled = false;
      }
    })
  }

  loginCelcom() {
    const { url, policyDEV, clientId, redirectUrlDEV, redirectUrlSIT, nonce, scope, responseType, responseMode, channelName, sessionID, prompt } = b2c;

    switch(currentEnvName) {
      case 'dev':
        window.location.href = `${url}?p=${policyDEV}&client_id=${clientId}&redirect_uri=${redirectUrlDEV}&nonce=${nonce}&scope=${scope}&response_mode=${responseMode}&response_type=${responseType}&prompt=${prompt}&channelName=${channelName}&sessionID=${sessionID}`;
        break;
      case 'sit':
        window.location.href = `${url}?p=${policyDEV}&client_id=${clientId}&redirect_uri=${redirectUrlSIT}&nonce=${nonce}&scope=${scope}&response_mode=${responseMode}&response_type=${responseType}&prompt=${prompt}&channelName=${channelName}&sessionID=${sessionID}`;
        break;
      default:
        window.location.href = `${currentEnv}${urlNav.frontofficehome}`;
    }
  }

  loginAccountManager() {
    this.msalService.loginRedirect();
  }
}