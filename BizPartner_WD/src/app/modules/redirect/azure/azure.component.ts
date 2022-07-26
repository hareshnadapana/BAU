import { Component, OnInit } from '@angular/core';
import { currentEnv, urlNav } from 'app/URL';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-azure',
  templateUrl: './azure.component.html',
  styleUrls: ['./azure.component.scss']
})
export class AzureComponent implements OnInit {

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit(): void {
      // window.location.href = `${currentEnv}${urlNav.frontofficehome}`
      // const currentURL = new URL(window.location.href);
      // const hash = new URLSearchParams(currentURL.hash.substring(1));
      // console.log(hash.get('id_token'));
      // console.log(window.location.hash);
      // const test = "https://dev.bizpartner.celcom.com.my/#code=0.AVQAdokEvxBxh06W88Z0SQi4vtP-gKUXUGhEpLVLClEoCdI-AIg.AgABAAIAAAD--DLA3VO7QrddgJg7WevrAgDs_wQA9P9NGHIKra0iz-XF3scrp833GW_hh0TWlJm6nWls2Ozy2mNCwmItsGrL6UzFP6TX1edSNEoBmqkNLjnj4sJSg4ebo4w5BU1OhC92_i8dxJHEmh4nFD28tKwuZCFmwgs7vrt-Ou7-umTfJDUBHkpRLUbAvPthGNKL2ZdM1l6h2wCggVQD4q5mzekC7MzUiQcN4d5j2MDehzuPdwydgQOKctDkOKm4pyUTqlINGi4CcRqHETMYYaiY3Qz4G5UGJcxi4x5ybd1vfdWxGL7m5lKA9aDfeAJgoHdGIq3VkfbKA_WPa_VIcDB7_V4VW_iMPF_v4RFZmoLqiOqLc5iaOrv98H3gk9c_L7_HpfnYAT-QWCfSwmViB2LwtXnq1YSHkRmjKe8AqxxnyeAMeNVZtd5GFlgF7tIjeN89AQ0JU4xWruxGtaEU75ZFgOKw-wldZn9I1JQBdD3SgbmAgGZDcP3gpDQrkmnrPdvimTSoCOAkm8PocwRCy9KH_nkvjMtOlMPEK0rxn4pKUlUV1CU_7y2Zb2bxTpTqbGBtO2-Lwq8wnSdFJtubFjJWLZvBvgyGGCCBo0H7PQOIj00wx_Rk9E8JnLPYUU9F6aqJJOnkE5i66ktyvxTADzIEJFfF3TFoLaax2gprAxEDLwXffD9IYSpGXlAEuadNr0W_dgb4QvApCidJbMg732izgqQhwF4CVDueqmZbdCOJiObfk18un5UKDazn8SJOWhYBkGAQ5T1JbdfzmeiEJsC4vMg5YFFLhZNcxO6m9TJHoVorYnv0hNwXdklFVyXoDACgD6hTePQEvFzdpxy6ZYHf&client_info=eyJ1aWQiOiJjNmYxN2Q1Zi04NjU5LTQ3MzMtOWI4My01ZDg1YWQ3YWE3M2YiLCJ1dGlkIjoiYmYwNDg5NzYtNzExMC00ZTg3LTk2ZjMtYzY3NDQ5MDhiOGJlIn0&state=eyJpZCI6IjBjNTA0NjFjLTcyMWEtNGZmMS1hNDg1LTE2YjUxMWI2NDM0NCIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3d&session_state=5a22316b-7b20-4b17-a467-492601b16bef"
      // const lol = "https://10.8.44.4:20103/frontoffice/#id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6InJnVHU2bXJrZEEzYjRZWF9VVVhQUXQwWjlmOWxuRFdSdlVFVndmX1QweFkifQ.eyJleHAiOjE2NTM2MzcxMTksIm5iZiI6MTY1MzYzMzUxOSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9jZWxjb21iMmMuYjJjbG9naW4uY29tL2ZmMzI1ODYxLTljNjAtNDYwYi04NmE3LTc4MWRlMGIzNTViNS92Mi4wLyIsInN1YiI6ImM1YTI2YTNjLWJkNjctNGIyMi05MmI4LTJjZjY4ZWMzYzk4OCIsImF1ZCI6ImQ2ODBjNDg3LTQ3ZjMtNDNlYi05ZWI1LTUzOTJjZGJkNTlhZiIsImFjciI6ImIyY18xYV9hYWRiMmNfcHJvdG8yX3NpZ25pbiIsImlhdCI6MTY1MzYzMzUxOSwiYXV0aF90aW1lIjoxNjUzNjMzNTE5LCJjaGFubmVsTmFtZSI6IkJJWlAiLCJzaWduSW5OYW1lIjoiVGVzdCBCaXpQYXJ0bmVyNCIsInNlc3Npb25JRCI6IjIyMjIiLCJ1cG4iOiJiNWE0ZGFkMC1hOThjLTRjMzYtODJlMC05NGJiZGVkNjk1ZTJAY2VsY29tYjJjLm9ubWljcm9zb2Z0LmNvbSIsImdpdmVuX25hbWUiOiJNdWhhbW1hZCBBZGFtIGJpbiBEYXluaW9sZCBAIFNoYWhydWRkaW4iLCJpc0ZvcmdvdFBhc3N3b3JkIjpmYWxzZX0.J7YfCTPIRjNcl_0f354bk2k8lEIX8oLioEbXUbDH_IGAtv_OhbbAjCP8Ir5VG81RLFVrrUxX_iEjId0NZuK4jEst3EeezREe5iQYDXy9X0vokdtoQtRi9JM_5IDsLWXQ-i2btY7msHlbqBrP7UitNaKsW-uv-zyzwJfQTO_T76sP7m0NGTz-i0_N_ZmkBY7TM-WYqeOu-qc8OXdoDAa616m0ChHAGBm3LqCGtHiQTu-30HeeacQPI6F4xyBz1wZj79s5zc7GpvVXFiiSgucXXKphXfOyiR9ESPxpIlSZ4PRqCaIBJ1tGHDmf0G4GZXp9N_GvYyevu_neMgzsAlrt7w"
      // console.log(window.location.href);
      
      this.router.navigate(['/dashboard/dealer']);

    }
}