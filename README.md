# 🐝 ApiMiel

**ApiMiel** est une application mobile qui vous permet de **scanner un pot de miel** pour en **vérifier la pureté**. Grâce à un algorithme connecté à **Open Food Facts**, elle vous donne un score de qualité allant de **0 à 100**.

## 📸 Aperçu de l'application

![Mockup de l'application ApiMiel](./assets/images/mockup-apimiel.png)

## 🚀 Fonctionnalités

- 📷 **Scanner** un code-barres de pot de miel
- 🧠 **Analyser** la composition et l'origine via Open Food Facts
- 🥇 **Obtenir** un score de pureté entre 0 et 100, avec le détail des points
- 🕘 **Retrouver** les pots déjà scannés dans l'historique (50 derniers, enregistrés sur le téléphone)
- ⭐ **Mettre en favoris** les miels à racheter et les filtrer en un geste
- 📝 **Compléter** une fiche Open Food Facts vide grâce à un lien direct
- ✨ Design épuré et animations ludiques pour une meilleure expérience utilisateur

## 🧪 Comment ça marche ?

1. **Scannez**  
   Pointez votre caméra sur le code-barres d’un pot de miel.

2. **Analysez**  
   L’application interroge Open Food Facts pour analyser les ingrédients et l’origine du produit.

3. **Découvrez**  
   Obtenez un **score ApiMiel** allant de 0 (pas pur du tout) à 100 (miel pur garanti 🍯).

4. **Retrouvez**  
   Chaque scan rejoint l'onglet **Historique**. Touchez un pot pour revoir son résultat, ou l'étoile ⭐ pour l'ajouter à vos favoris. Le filtre **★ Favoris** n'affiche que ceux-là.

## 🕘 Historique et favoris

- L'historique garde les **50 derniers pots** scannés, du plus récent au plus ancien. Rescanner un pot le remonte en tête, sans doublon.
- Les **favoris ne sont jamais perdus** : au-delà de 50 pots, ce sont les plus anciens non favoris qui sortent, et la corbeille vide l'historique en conservant les favoris.
- Tout est enregistré **localement sur le téléphone** (AsyncStorage) : aucun compte, aucune donnée envoyée.

La logique est dans `utils/history.ts`.

## 🧮 Calcul du score

Chaque miel part d'un score de base de **60**, puis gagne ou perd des points :

| Critère | Points |
|---|---|
| Ingrédients : 100 % miel | **+30** |
| Ingrédients non renseignés (miel présumé pur, la loi européenne interdit tout ajout) | **+15** |
| Sirop ou sucre ajouté détecté | **−50** |
| Origine : France | 0 |
| Origine : Union européenne | −5 |
| Origine non renseignée | −10 |
| Origine : mélange UE / non UE, ou hors UE | −15 |
| Transformation NOVA 3 | −10 |
| Transformation NOVA 4 | −25 |

Le score final est borné entre 0 et 100 :

- **80 et plus** : excellent miel
- **50 à 79** : miel correct
- **moins de 50** : miel à éviter

Un produit qu'Open Food Facts ne classe pas comme miel n'est pas noté. Si sa fiche n'a aucune catégorie, l'application invite à la compléter sur Open Food Facts.

Les règles sont regroupées dans `utils/scoring.ts` (objet `SCORING`).

## 💾 Données utilisées

- [Open Food Facts](https://openfoodfacts.org) — base de données libre sur les produits alimentaires.

## 🛠️ Stack technique

- **React Native** (via Expo)
- **Expo Router**
- **StyleSheet** React Native + **expo-linear-gradient**
- **expo-camera** (scan de codes-barres)
- **AsyncStorage** (historique et favoris sur le téléphone)
- **Open Food Facts API**
- **Jest** pour les tests (`npx jest`)

## 📱 Installation

```bash
git clone https://github.com/Maeva-RODRIGUES/api-miel.git
cd api-miel
npm install
npx expo start
```

Si le téléphone n'arrive pas à joindre l'ordinateur sur le réseau local, passez par un tunnel : `npx expo start --tunnel ngrok`.

Après l'ajout d'une dépendance, relancez le serveur en vidant le cache : `npx expo start -c`.

## 🧑‍💻 Contributrice

Développé avec amour par Maëva Rodrigues 💛
