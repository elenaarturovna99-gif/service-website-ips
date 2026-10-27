export const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://heavyprom.ru/#organization",
      "name": "ХэвиПром",
      "legalName": "ИП Каримова Елена Артуровна",
      "taxID": "741708300897",
      "url": "https://heavyprom.ru/",
      "logo": "https://heavyprom.ru/favicon-120.png",
      "image": "https://heavyprom.ru/og-image.jpg",
      "description": "Исполнительная документация, аудит и строительный контроль на промышленных объектах: газохимия, нефтехимия, энергетика, заводы.",
      "telephone": "+7-904-941-36-69",
      "email": "info@heavyprom.ru",
      "areaServed": {
        "@type": "Country",
        "name": "Россия"
      },
      "sameAs": [
        "https://dzen.ru/heavyprom.ru"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+7-904-941-36-69",
        "email": "info@heavyprom.ru",
        "contactType": "customer service",
        "availableLanguage": [
          "ru",
          "en"
        ]
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Услуги",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Разработка исполнительной документации",
              "url": "https://heavyprom.ru/uslugi/razrabotka-ispolnitelnoj-dokumentacii"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Восстановление исполнительной документации",
              "url": "https://heavyprom.ru/uslugi/vosstanovlenie-ispolnitelnoj-dokumentacii"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Аудит исполнительной документации",
              "url": "https://heavyprom.ru/uslugi/audit-ispolnitelnoj-dokumentacii"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Контроль качества строительно-монтажных работ",
              "url": "https://heavyprom.ru/uslugi/kontrol-kachestva"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Строительный контроль со стороны заказчика",
              "url": "https://heavyprom.ru/uslugi/stroitelnyj-kontrol"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Составление и проверка смет",
              "url": "https://heavyprom.ru/uslugi/sostavlenie-i-proverka-smet"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Ведомости объёмов работ (ВОР)",
              "url": "https://heavyprom.ru/uslugi/vedomosti-obemov-rabot"
            }
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://heavyprom.ru/#website",
      "url": "https://heavyprom.ru/",
      "name": "ХэвиПром",
      "inLanguage": "ru-RU",
      "publisher": {
        "@id": "https://heavyprom.ru/#organization"
      }
    }
  ]
};
