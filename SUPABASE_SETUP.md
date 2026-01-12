# Configuration Supabase Requise

Pour que l'application fonctionne correctement, vous devez configurer Supabase :

## Option 1 : Activer l'authentification anonyme (Recommandé)

1. Allez sur votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Providers**
4. Activez **Anonymous Sign-ins**

## Option 2 : Désactiver la confirmation d'email

Si vous préférez utiliser l'authentification automatique par device ID (système actuel) :

1. Allez sur votre dashboard Supabase
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Settings**
4. Sous **Email Auth**, décochez **Enable email confirmations**

## Pourquoi cette configuration est nécessaire ?

L'application crée automatiquement des utilisateurs pour permettre à chacun d'utiliser l'app sans processus de connexion manuel. Sans l'une de ces configurations, les utilisateurs ne peuvent pas accéder aux données car :

- L'authentification anonyme est désactivée par défaut
- La confirmation d'email est requise par défaut pour les nouveaux comptes

## État actuel

L'application utilise un système d'authentification automatique qui :
- Génère un ID d'appareil unique stocké dans le localStorage
- Crée ou connecte un utilisateur avec cet ID
- Permet l'accès immédiat à l'application

Une fois configuré, l'application fonctionnera automatiquement sans intervention de l'utilisateur.
