import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import * as Color from 'color';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  renderer: Renderer2;
  private themes: { [name: string]: any } = {};
  private currentTheme: BehaviorSubject<string> = new BehaviorSubject<string>('light'); // Default theme

  constructor(private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.themes = {
      light: {
        primary: '#3e5eb9',
        secondary: '#BF0404',
        tertiary: '#7086c2',
        success: '#149911',
        warning: '#f7e096',
        danger: '#A31621',
        dark: '#071108',
        medium: '#989aa2',
        light: '#FFFFFF',
        black: '#000000',
        bg: '#fff',
        disabled: '#ebeaed',
        header: '#EBEFF8',
        image: 'invert(0) brightness(2)',
        serviceImage: 'invert(0) brightness(2)',
        logo: 'invert(0) brightness(2)',
        shadow: '#000',
        placeholder: '#000',
        headerCard: '#D9E1F2',
        toggle: '#EBEFF8',
        lightCard: '#fff',
        pageRgbBg: '#3e5eb9',
        testImage: 'assets/icon/download-referance-data.png',
        serviceCard: '#EBEEF7',
        borderColor: '#c9c9c9',
        loginCardBg: '#fff',
        serviceCardBg: '#d9e1f2',
        backdrop: '#00000050',
      },
      dark: {
        primary: '#3e5eb9',
        secondary: '#52525b',
        tertiary: '#262626',
        light: '#1b262c',
        dark: '#a3a3a3',
        medium: '#71717a',
        success: '#149911',
        warning: '#F1D302',
        danger: '#A31621',
        border: '#0000000020',
        disabled: '#2b2b2b',
        header: '#121010',
        black: '#fff',
        image: 'invert(1) brightness(2)',
        serviceImage: 'brightness(0) invert(1)',
        logo: 'invert(0) brightness(2)',
        shadow: '#181A20',
        placeholder: '#fff',
        headerCard: '#181A20',
        toggle: '#2B2B2B',
        lightCard: '#121c22',
        pageRgbBg: '#181A20',
        testImage: 'assets/icon/download-referance-data.png',
        serviceCard: '#2f2f2f',
        borderColor: '#595959',
        loginCardBg: '#282a36',
        serviceCardBg: '#121c22',
        backdrop: '#00000050',
      },
      // gray: {
      //   primary: '#3e5eb9',
      //   secondary: '#adf',
      //   tertiary: '#adadad',
      //   dark: '#fff',
      //   light: '#121C22',
      //   success: '#149911',
      //   warning: '#F1D302',
      //   danger: '#A31621',
      //   medium: '#BCC2C7',
      //   bg: '#2B2B2B',
      //   border: '#0000000020',
      //   disabled: '#92929294',
      //   header: '#5F5F5F',
      //   black: '#fff',
      //   image: 'invert(1) brightness(2)',
      //   serviceImage: 'brightness(0) invert(1)',
      //   logo: 'brightness(0) invert(1)',
      //   shadow: '#000',
      //   placeholder: '#fff',
      //   headerCard: '#333333',
      //   toggle: '#333333',
      //   lightCard: '#181A20',
      //   pageRgbBg: '#181A20',
      //   testImage: 'assets/icon/download-referance-data.png',
      //   serviceCard: '#9d9d9d',
      //   borderColor: '#7b7b7b',
      // },
    };
    if (this.getGlobalCSS() === '') {
      this.setTheme('light');
    }
  }

  // * Set the global CSS variable
  setTheme(theme: string) {
    const cssText = this.CSSTextGenerator(this.themes[theme]);
    this.setGlobalCSS(cssText);
    this.currentTheme.next(theme); // Update the current theme state
  }

  // * Get the current theme name
  getCurrentTheme(): Observable<string> {
    return this.currentTheme.asObservable();
  }

  // * Set the global CSS variable
  private setGlobalCSS(css: string) {
    this.document.documentElement.style.cssText = css;
  }

  getGlobalCSS() {
    return this.document.documentElement.style.cssText;
  }

  // * Generate the CSS for the theme
  CSSTextGenerator(colors: any) {
    colors = { ...colors };
    const {
      primary,
      secondary,
      tertiary,
      success,
      warning,
      danger,
      dark,
      medium,
      light,
      border,
      black,
      disabled,
      header,
      image,
      serviceImage,
      shadow,
      placeholder,
      headerCard,
      toggle,
      lightCard,
      pageRgbBg,
      logo,
      testImage,
      serviceCard,
      borderColor,
      loginCardBg,
      serviceCardBg,
      backdrop,
    } = colors;

    const shadeRatio = 0.1;
    const tintRatio = 0.1;

    return `
      --ion-item-disabled-background: ${disabled};
      --ion-item-test: ${testImage};
      --ion-item-service-card: ${serviceCard};
      --ion-item-service-card-bg: ${serviceCardBg};
      --ion-item-color-border: ${borderColor};
      --ion-item-login-bg: ${loginCardBg};

      --ion-color-base: ${light};
      --ion-color-contrast: ${dark};
      --ion-background-color: ${light};
      --ion-text-color: ${dark};
      --ion-toolbar-background-color: ${Color(primary).alpha(0.1).rgb().string()};
      --ion-toolbar-text-color: ${this.contrast(dark, 0.1)};
      --ion-item-background-color: ${Color(primary).alpha(0.14).rgb().string()};
      --ion-item-light-card-bg: ${lightCard};
      --ion-page-gardant-bg: ${pageRgbBg};
  
      --ion-item-text-color: ${this.contrast(dark, 0.3)};
      --ion-backdrop-color: ${backdrop};
      --ion-backdrop-opacity: 0.4;
      
      --ion-border-color: ${Color(black).alpha(0.2).rgb().string()};
      --ion-box-shadow-color: ${Color(shadow).alpha(0.15).rgb().string()};
      --ion-tab-bar-background: ${this.contrast(light, 0.1)};
      --ion-tab-bar-color: ${this.contrast(dark, 0.1)};
      --ion-tab-bar-selected-color: ${primary};
      --ion-tab-bar-border-color: ${Color(black).alpha(0.1).rgb().string()};
      --ion-tab-bar-background-focused: ${this.contrast(light, 0.1)};
      --ion-tab-bar-color-selected: ${primary};
      --ion-toolbar-background: ${this.contrast(light, 0.1)};
      --ion-toolbar-color: ${this.contrast(dark, 0.1)};
      --ion-toolbar-border-color: ${this.contrast(dark, 0.3)};
      --ion-toolbar-segment-color: ${this.contrast(dark, 0.1)};
      --ion-toolbar-segment-color-checked: ${primary};
      --ion-toolbar-segment-background: ${this.contrast(light, 0.1)};
      --ion-toolbar-segment-background-checked: ${this.contrast(primary, 0.1)};
      --ion-toolbar-segment-indicator-color: ${primary};
      --ion-item-background: ${this.contrast(light, 0.3)};
      --ion-item-color: ${this.contrast(dark, 0.3)};
      --ion-placeholder-color: ${placeholder};

      --ion-color-primary: ${primary};
      --ion-color-primary-rgb: 56,128,255;
      --ion-color-primary-contrast: ${this.contrast(primary)};
      --ion-color-primary-contrast-rgb: 255,255,255;
      --ion-color-primary-shade:  ${Color(primary).alpha(0.1).rgb().string()};
      --ion-color-primary-tint:  ${Color(primary).lighten(tintRatio)};
  
      --ion-color-secondary: ${secondary};
      --ion-color-secondary-rgb: 12,209,232;
      --ion-color-secondary-contrast: ${this.contrast(secondary)};
      --ion-color-secondary-contrast-rgb: 255,255,255;
      --ion-color-secondary-shade:  ${Color(secondary).darken(shadeRatio)};
      --ion-color-secondary-tint: ${Color(secondary).lighten(tintRatio)};
  
      --ion-color-tertiary:  ${tertiary};
      --ion-color-tertiary-rgb: 112,68,255;
      --ion-color-tertiary-contrast: ${this.contrast(tertiary)};
      --ion-color-tertiary-contrast-rgb: 255,255,255;
      --ion-color-tertiary-shade: ${Color(tertiary).darken(shadeRatio)};
      --ion-color-tertiary-tint:  ${Color(tertiary).lighten(tintRatio)};
  
      --ion-color-success: ${success};
      --ion-color-success-rgb: 16,220,96;
      --ion-color-success-contrast: ${this.contrast(success)};
      --ion-color-success-contrast-rgb: 255,255,255;
      --ion-color-success-shade: ${Color(success).darken(shadeRatio)};
      --ion-color-success-tint: ${Color(success).lighten(tintRatio)};
  
      --ion-color-warning: ${warning};
      --ion-color-warning-rgb: 255,206,0;
      --ion-color-warning-contrast: ${this.contrast(warning)};
      --ion-color-warning-contrast-rgb: 255,255,255;
      --ion-color-warning-shade: ${Color(warning).darken(shadeRatio)};
      --ion-color-warning-tint: ${Color(warning).lighten(tintRatio)};
  
      --ion-color-danger: ${danger};
      --ion-color-danger-rgb: 245,61,61;
      --ion-color-danger-contrast: ${this.contrast(danger)};
      --ion-color-danger-contrast-rgb: 255,255,255;
      --ion-color-danger-shade: ${Color(danger).darken(shadeRatio)};
      --ion-color-danger-tint: ${Color(danger).lighten(tintRatio)};
  
      --ion-color-dark: ${dark};
      --ion-color-dark-rgb: 34,34,34;
      --ion-color-dark-contrast: ${this.contrast(dark)};
      --ion-color-dark-contrast-rgb: 255,255,255;
      --ion-color-dark-shade: ${Color(dark).darken(shadeRatio)};
      --ion-color-dark-tint: ${Color(dark).lighten(tintRatio)};
  
      --ion-color-medium: ${medium};
      --ion-color-medium-rgb: 152,154,162;
      --ion-color-medium-contrast: ${this.contrast(medium)};
      --ion-color-medium-contrast-rgb: 255,255,255;
      --ion-color-medium-shade: ${Color(medium).darken(shadeRatio)};
      --ion-color-medium-tint: ${Color(medium).lighten(tintRatio)};
  
      --ion-color-light: ${light};
      --ion-color-light-rgb: 244,244,244;
      --ion-color-light-contrast: $${this.contrast(light)};
      --ion-color-light-contrast-rgb: 0,0,0;
      --ion-color-light-shade: ${Color(light).darken(shadeRatio)};
      --ion-color-light-tint: ${Color(light).lighten(tintRatio)};
      --ion-color-header: ${header};
      --ion-color-black: ${black};
      --ion-color-image: ${image};
      --ion-color-logo: ${logo};
      --ion-color-serviceImage: ${serviceImage};
      --ion-color-head-card: ${headerCard};
      --ion-color-toggle: ${toggle};
      --ion-color-gray: ${this.contrast(black, 0.3)}`;
  }

  contrast(color: any, ratio = 0.9) {
    color = Color(color);
    return color.mix(Color('#fff'), ratio);
  }
}
