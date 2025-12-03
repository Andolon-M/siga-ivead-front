export interface ChurchSettings {
  name: string
  address: string
  phone: string
  email: string
  description: string
}

export interface SocialMediaSettings {
  facebook?: string
  instagram?: string
  youtube?: string
}

export interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  notificationEmail: string
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
}

export interface AppearanceSettings {
  primaryColor: string
  logo?: string
}

export interface UpdateChurchSettingsData extends Partial<ChurchSettings> {}
export interface UpdateSocialMediaSettingsData extends Partial<SocialMediaSettings> {}
export interface UpdateNotificationSettingsData extends Partial<NotificationSettings> {}
export interface UpdateSecuritySettingsData extends Partial<SecuritySettings> {}
export interface UpdateAppearanceSettingsData extends Partial<AppearanceSettings> {}

