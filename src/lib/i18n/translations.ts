export const translations = {
  ja: {
    // Common
    loading: '読み込み中...',
    email: 'メールアドレス',
    password: 'パスワード',
    confirmPassword: 'パスワードを確認',
    displayName: '表示名',

    // Login page
    login: {
      title: 'ログイン',
      subtitle: 'アカウントにログインしてください',
      button: 'ログイン',
      loading: 'ログイン中...',
      forgotPassword: 'パスワードをお忘れですか？',
      noAccount: 'アカウントをお持ちでないですか？',
      signupLink: '新規登録',
      footer: 'ログインすることで、アプリへのアクセス許可を管理できます',
      emailPlaceholder: 'example@email.com',
      passwordPlaceholder: '••••••••',
    },

    // Signup page
    signup: {
      title: 'アカウント作成',
      subtitle: '新しいアカウントを作成します',
      button: 'アカウントを作成',
      loading: 'アカウント作成中...',
      displayNamePlaceholder: 'ニックネーム（任意）',
      hasAccount: 'すでにアカウントをお持ちですか？',
      loginLink: 'ログイン',
      termsPrefix: 'アカウントを作成することで、',
      termsLink: '利用規約',
      termsMiddle: 'と',
      privacyLink: 'プライバシーポリシー',
      termsSuffix: 'に同意したものとみなされます',
      successTitle: '確認メールを送信しました',
      successMessage: '{email} に確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。',
    },

    // Forgot password page
    forgotPassword: {
      title: 'パスワードをお忘れですか？',
      subtitle: 'メールアドレスを入力してください',
      button: 'リセットメールを送信',
      loading: '送信中...',
      backToLogin: 'ログインに戻る',
      successTitle: 'メールを送信しました',
      successMessage: '{email} にパスワードリセット用のリンクを送信しました。メールをご確認ください。',
    },

    // Reset password page
    resetPassword: {
      title: '新しいパスワードを設定',
      subtitle: '安全なパスワードを入力してください',
      newPassword: '新しいパスワード',
      button: 'パスワードを更新',
      loading: '更新中...',
      checking: '確認中...',
      invalidLinkTitle: 'リンクが無効です',
      invalidLinkMessage: 'パスワードリセットのリンクが無効または期限切れです。',
      sendNewEmail: '新しいリセットメールを送信する',
      successTitle: 'パスワードを更新しました',
      successMessage: '新しいパスワードでログインできます。',
      loginButton: 'ログインする',
    },

    // OAuth consent page
    consent: {
      title: 'アクセス許可のリクエスト',
      requestAccess: 'アプリがあなたのアカウントへのアクセスを求めています',
      permissions: '以下の情報へのアクセスを許可します：',
      profile: 'プロフィール情報（名前、メールアドレス）',
      allow: '許可する',
      deny: '拒否',
      loading: '処理中...',
      footer: '許可すると、アプリにリダイレクトされます',
      error: 'エラー',
      noAuthorizationId: 'authorization_id が見つかりません',
      noRedirectUrl: 'リダイレクトURLが取得できませんでした',
      close: '閉じる',
      cannotProcess: 'このリクエストは処理できません',
      expired: 'リクエストの有効期限が切れました',
      backToApp: 'アプリに戻る',
    },

    // Errors
    errors: {
      passwordMismatch: 'パスワードが一致しません',
      passwordTooShort: 'パスワードは6文字以上で入力してください',
    },

    // Terms page
    terms: {
      title: '利用規約',
      serviceName: 'MindBrew Auth',
      lastUpdated: '最終更新日',
      intro: '本利用規約（以下「本規約」）は、MindBrew Auth（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様は、本規約に同意の上、本サービスをご利用ください。',
      backToSignup: 'アカウント作成に戻る',
      section1: {
        title: '第1条（適用）',
        content: '本規約は、ユーザーと本サービス運営者（以下「運営者」）との間の本サービスの利用に関わる一切の関係に適用されます。',
      },
      section2: {
        title: '第2条（利用登録）',
        items: [
          '本サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を行うものとします。',
          '運営者は、虚偽の情報を登録した場合、過去に本規約に違反したことがある場合、その他運営者が不適切と判断した場合に利用登録を拒否することがあります。',
        ],
      },
      section3: {
        title: '第3条（アカウント管理）',
        items: [
          'ユーザーは、自己の責任において、アカウント情報を適切に管理するものとします。',
          'ユーザーは、アカウント情報を第三者に利用させ、または貸与、譲渡、売買等をしてはなりません。',
          'アカウント情報の不正使用により生じた損害について、運営者は一切の責任を負いません。',
        ],
      },
      section4: {
        title: '第4条（禁止事項）',
        intro: 'ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：',
        items: [
          '法令または公序良俗に違反する行為',
          '犯罪行為に関連する行為',
          '運営者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為',
          '本サービスの運営を妨害する行為',
          '他のユーザーに関する個人情報等を収集または蓄積する行為',
          '他のユーザーに成りすます行為',
          '不正アクセス、またはアカウントの不正利用',
          'その他、運営者が不適切と判断する行為',
        ],
      },
      section5: {
        title: '第5条（本サービスの提供の停止等）',
        items: [
          '運営者は、システムの保守点検、不可抗力、その他運営者が本サービスの提供が困難と判断した場合、事前の通知なく本サービスの全部または一部の提供を停止または中断することがあります。',
          '運営者は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。',
        ],
      },
      section6: {
        title: '第6条（利用制限および登録抹消）',
        items: [
          '運営者は、ユーザーが本規約に違反した場合、事前の通知なく、当該ユーザーに対して本サービスの全部または一部の利用を制限し、またはユーザー登録を抹消することができます。',
          '運営者は、本条に基づき運営者が行った行為によりユーザーに生じた損害について、一切の責任を負いません。',
        ],
      },
      section7: {
        title: '第7条（免責事項）',
        content: '運営者は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。',
      },
      section8: {
        title: '第8条（利用規約の変更）',
        content: '運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、本サービス上に掲載された時点から効力を生じるものとします。',
      },
      contact: {
        title: 'お問い合わせ',
        description: '本規約に関するご質問やご要望は、以下までご連絡ください：',
        email: 'メール',
      },
    },

    // Privacy page
    privacy: {
      title: 'プライバシーポリシー',
      serviceName: 'MindBrew Auth',
      lastUpdated: '最終更新日',
      intro: '本プライバシーポリシーは、MindBrew Auth（以下「本サービス」）における個人情報の取り扱いについて説明します。',
      backToSignup: 'アカウント作成に戻る',
      section1: {
        title: '1. 収集する情報',
        intro: '本サービスでは、以下の情報を収集します：',
        items: [
          { label: 'アカウント情報', description: 'メールアドレス、表示名' },
          { label: '認証データ', description: 'ログイン日時、連携アプリケーション' },
          { label: '利用状況', description: 'サービスの利用日時、アクセス元情報' },
        ],
      },
      section2: {
        title: '2. 情報の利用目的',
        intro: '収集した情報は、以下の目的で利用します：',
        items: [
          'ユーザー認証およびアカウント管理',
          'OAuth連携アプリケーションへのアクセス許可',
          'サービスの改善および新機能の開発',
          'お問い合わせへの対応',
        ],
      },
      section3: {
        title: '3. 情報の共有',
        intro: '本サービスでは、以下の場合を除き、個人情報を第三者に提供することはありません：',
        items: [
          'ユーザーが許可した連携アプリケーションへの情報提供',
          'ユーザーの同意がある場合',
          '法令に基づく場合',
          'サービス提供に必要なインフラストラクチャプロバイダー（Supabase）への委託',
        ],
      },
      section4: {
        title: '4. データの保管',
        content: 'ユーザーデータは、Supabase（クラウドデータベースサービス）に安全に保管されます。データは暗号化され、適切なセキュリティ対策が講じられています。',
      },
      section5: {
        title: '5. ユーザーの権利',
        intro: 'ユーザーは以下の権利を有します：',
        items: [
          { label: 'アクセス権', description: '自身の個人情報へのアクセスを要求する権利' },
          { label: '訂正権', description: '不正確な個人情報の訂正を要求する権利' },
          { label: '削除権', description: '個人情報の削除を要求する権利' },
          { label: 'データポータビリティ', description: '個人情報を機械可読形式で受け取る権利' },
        ],
      },
      section6: {
        title: '6. Cookie・トラッキング',
        content: '本サービスは、認証セッションの維持のためにローカルストレージを使用します。広告目的のトラッキングは行いません。',
      },
      section7: {
        title: '7. 子どものプライバシー',
        content: '本サービスは13歳未満の子どもを対象としていません。13歳未満のユーザーからの個人情報を意図的に収集することはありません。',
      },
      section8: {
        title: '8. プライバシーポリシーの変更',
        content: '本プライバシーポリシーは、必要に応じて更新されることがあります。重要な変更がある場合は、サービス内またはメールでお知らせします。',
      },
      contact: {
        title: 'お問い合わせ',
        description: 'プライバシーに関するご質問やご要望は、以下までご連絡ください：',
        email: 'メール',
      },
    },
  },

  en: {
    // Common
    loading: 'Loading...',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    displayName: 'Display Name',

    // Login page
    login: {
      title: 'Login',
      subtitle: 'Sign in to your account',
      button: 'Login',
      loading: 'Logging in...',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      signupLink: 'Sign up',
      footer: 'By logging in, you can manage app access permissions',
      emailPlaceholder: 'example@email.com',
      passwordPlaceholder: '••••••••',
    },

    // Signup page
    signup: {
      title: 'Create Account',
      subtitle: 'Create a new account',
      button: 'Create Account',
      loading: 'Creating account...',
      displayNamePlaceholder: 'Nickname (optional)',
      hasAccount: 'Already have an account?',
      loginLink: 'Login',
      termsPrefix: 'By creating an account, you agree to our ',
      termsLink: 'Terms of Service',
      termsMiddle: ' and ',
      privacyLink: 'Privacy Policy',
      termsSuffix: '',
      successTitle: 'Confirmation Email Sent',
      successMessage: 'We sent a confirmation email to {email}. Please click the link in the email to activate your account.',
    },

    // Forgot password page
    forgotPassword: {
      title: 'Forgot your password?',
      subtitle: 'Enter your email address',
      button: 'Send Reset Email',
      loading: 'Sending...',
      backToLogin: 'Back to login',
      successTitle: 'Email Sent',
      successMessage: 'We sent a password reset link to {email}. Please check your email.',
    },

    // Reset password page
    resetPassword: {
      title: 'Set New Password',
      subtitle: 'Enter a secure password',
      newPassword: 'New Password',
      button: 'Update Password',
      loading: 'Updating...',
      checking: 'Checking...',
      invalidLinkTitle: 'Invalid Link',
      invalidLinkMessage: 'This password reset link is invalid or has expired.',
      sendNewEmail: 'Send a new reset email',
      successTitle: 'Password Updated',
      successMessage: 'You can now log in with your new password.',
      loginButton: 'Login',
    },

    // OAuth consent page
    consent: {
      title: 'Access Permission Request',
      requestAccess: 'An app is requesting access to your account',
      permissions: 'Allow access to the following information:',
      profile: 'Profile information (name, email)',
      allow: 'Allow',
      deny: 'Deny',
      loading: 'Processing...',
      footer: 'You will be redirected to the app after approval',
      error: 'Error',
      noAuthorizationId: 'authorization_id not found',
      noRedirectUrl: 'Could not get redirect URL',
      close: 'Close',
      cannotProcess: 'This request cannot be processed',
      expired: 'This request has expired',
      backToApp: 'Back to App',
    },

    // Errors
    errors: {
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
    },

    // Terms page
    terms: {
      title: 'Terms of Service',
      serviceName: 'MindBrew Auth',
      lastUpdated: 'Last Updated',
      intro: 'These Terms of Service ("Terms") govern the use of MindBrew Auth ("Service"). By using this Service, you agree to these Terms.',
      backToSignup: 'Back to Sign Up',
      section1: {
        title: 'Article 1 (Scope)',
        content: 'These Terms apply to all matters related to the use of the Service between the user and the Service operator ("Operator").',
      },
      section2: {
        title: 'Article 2 (Registration)',
        items: [
          'Users wishing to use this Service shall register by the prescribed method after agreeing to these Terms.',
          'The Operator may refuse registration if false information is provided, if the user has previously violated these Terms, or if the Operator deems it inappropriate.',
        ],
      },
      section3: {
        title: 'Article 3 (Account Management)',
        items: [
          'Users shall properly manage their account information at their own responsibility.',
          'Users shall not allow third parties to use their account information, nor lend, transfer, or sell it.',
          'The Operator shall not be liable for any damage caused by unauthorized use of account information.',
        ],
      },
      section4: {
        title: 'Article 4 (Prohibited Activities)',
        intro: 'Users shall not engage in the following activities when using the Service:',
        items: [
          'Activities that violate laws or public morals',
          'Activities related to criminal acts',
          'Activities that destroy or interfere with the Operator\'s servers or network functions',
          'Activities that interfere with the operation of the Service',
          'Activities that collect or accumulate personal information about other users',
          'Impersonating other users',
          'Unauthorized access or misuse of accounts',
          'Other activities deemed inappropriate by the Operator',
        ],
      },
      section5: {
        title: 'Article 5 (Service Suspension)',
        items: [
          'The Operator may suspend or interrupt all or part of the Service without prior notice due to system maintenance, force majeure, or if the Operator determines that provision of the Service is difficult.',
          'The Operator shall not be liable for any disadvantage or damage incurred by users or third parties due to suspension or interruption of the Service.',
        ],
      },
      section6: {
        title: 'Article 6 (Usage Restrictions and Account Deletion)',
        items: [
          'The Operator may restrict all or part of the Service usage or delete user registration without prior notice if a user violates these Terms.',
          'The Operator shall not be liable for any damage caused to users by actions taken under this article.',
        ],
      },
      section7: {
        title: 'Article 7 (Disclaimer)',
        content: 'The Operator does not guarantee, either expressly or implicitly, that the Service is free from factual or legal defects. The Operator shall not be liable for any damage caused to users arising from the Service.',
      },
      section8: {
        title: 'Article 8 (Changes to Terms)',
        content: 'The Operator may change these Terms at any time without notice to users if deemed necessary. The revised Terms shall become effective when posted on the Service.',
      },
      contact: {
        title: 'Contact',
        description: 'For questions or requests regarding these Terms, please contact:',
        email: 'Email',
      },
    },

    // Privacy page
    privacy: {
      title: 'Privacy Policy',
      serviceName: 'MindBrew Auth',
      lastUpdated: 'Last Updated',
      intro: 'This Privacy Policy explains how MindBrew Auth ("Service") handles personal information.',
      backToSignup: 'Back to Sign Up',
      section1: {
        title: '1. Information We Collect',
        intro: 'The Service collects the following information:',
        items: [
          { label: 'Account Information', description: 'Email address, display name' },
          { label: 'Authentication Data', description: 'Login timestamps, connected applications' },
          { label: 'Usage Data', description: 'Service usage timestamps, access source information' },
        ],
      },
      section2: {
        title: '2. Purpose of Use',
        intro: 'Collected information is used for the following purposes:',
        items: [
          'User authentication and account management',
          'Granting access permissions to OAuth-connected applications',
          'Service improvement and new feature development',
          'Responding to inquiries',
        ],
      },
      section3: {
        title: '3. Information Sharing',
        intro: 'The Service does not provide personal information to third parties except in the following cases:',
        items: [
          'Providing information to connected applications authorized by the user',
          'When the user consents',
          'When required by law',
          'Entrustment to infrastructure providers (Supabase) necessary for service provision',
        ],
      },
      section4: {
        title: '4. Data Storage',
        content: 'User data is securely stored in Supabase (cloud database service). Data is encrypted and appropriate security measures are implemented.',
      },
      section5: {
        title: '5. User Rights',
        intro: 'Users have the following rights:',
        items: [
          { label: 'Right of Access', description: 'The right to request access to your personal information' },
          { label: 'Right to Rectification', description: 'The right to request correction of inaccurate personal information' },
          { label: 'Right to Erasure', description: 'The right to request deletion of personal information' },
          { label: 'Data Portability', description: 'The right to receive personal information in a machine-readable format' },
        ],
      },
      section6: {
        title: '6. Cookies & Tracking',
        content: 'The Service uses local storage to maintain authentication sessions. No tracking is performed for advertising purposes.',
      },
      section7: {
        title: '7. Children\'s Privacy',
        content: 'The Service is not intended for children under 13 years of age. We do not intentionally collect personal information from users under 13.',
      },
      section8: {
        title: '8. Changes to Privacy Policy',
        content: 'This Privacy Policy may be updated as necessary. Significant changes will be notified through the Service or by email.',
      },
      contact: {
        title: 'Contact',
        description: 'For questions or requests regarding privacy, please contact:',
        email: 'Email',
      },
    },
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.ja
