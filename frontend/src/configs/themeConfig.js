const themeConfig = {
  // ** Layout Configs
  templateName: 'Inbox',
  layout: 'vertical',
  mode: 'light',
  direction: 'ltr',
  skin: 'default',
  contentWidth: 'boxed',
  // ** Routing Configs
  routingLoader: true,
  // ** Navigation (Menu) Configs
  navHidden: false,
  menuTextTruncate: true,
  navSubItemIcon: 'mdi:circle',
  verticalNavToggleType: 'accordion',
  navCollapsed: false,
  navigationSize: 260,
  collapsedNavigationSize: 68,
  afterVerticalNavMenuContentPosition: 'fixed',
  beforeVerticalNavMenuContentPosition: 'fixed',
  horizontalMenuToggle: 'hover',
  horizontalMenuAnimation: true,
  // ** AppBar Configs
  appBar: 'fixed',
  appBarBlur: true,
  // ** Other Configs
  responsiveFontSizes: true,
  disableRipple: false,
  disableCustomizer: true,
  toastPosition: 'top-right'
}
export default themeConfig
