import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';
import { commonStoreReducer } from './root-store.reducer';
import { CelcomEffects } from './root-store.effect'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('commonStore',commonStoreReducer),
    // EffectsModule.forFeature([CelcomEffects])
  ]
})
export class CommonStoreModule { }
