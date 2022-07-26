import { Component, OnInit } from "@angular/core";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(500)
      ]),
    ])
  ]
})

export class LoginComponent implements OnInit {

  chooseField: boolean = true;
  register: boolean = false;
  login: boolean = false;
  loginButtonDisabled: boolean = true;

  loginForm: FormGroup = this.builder.group({
    username: [, { updateOn: "change"}],
    password: [, { updateOn: "change"}],
    rememberMe: [false, { updateOn: "change"}]
  })

  constructor(private builder: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loginFormValidation();
  }

  fieldSelection(type: string) {
    if (type == 'login') {
      this.chooseField = false;
      this.register = false;
    } else if (type == 'chooseField') {
      this.register = false;
      this.login = false;
    }
    setTimeout(() => {
      this[type] = true;
    }, 500);
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

  submitLogin() {
    // login logic here
    this.router.navigate(['/home']);
  }
}