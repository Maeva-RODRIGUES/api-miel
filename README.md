# 🐝 ApiMiel

**ApiMiel** est une application mobile qui vous permet de **scanner un pot de miel** pour en **vérifier la pureté**. Grâce à un algorithme connecté à **Open Food Facts**, elle vous donne un score de qualité allant de **0 à 100**.

## 📸 Aperçu de l'application

![Mockup de l'application ApiMiel](./assets/images/mockup-apimiel.png)

## 🚀 Fonctionnalités

- 📷 **Scanner** un code-barres de pot de miel
- 🧠 **Analyser** la composition et l'origine via Open Food Facts
- 🥇 **Obtenir** un score de pureté entre 0 et 100
- ✨ Design épuré et animations ludiques pour une meilleure expérience utilisateur

## 🧪 Comment ça marche ?

1. **Scannez**  
   Pointez votre caméra sur le code-barres d’un pot de miel.

2. **Analysez**  
   L’application interroge Open Food Facts pour analyser les ingrédients et l’origine du produit.

3. **Découvrez**  
   Obtenez un **score ApiMiel** allant de 0 (pas pur du tout) à 100 (miel pur garanti 🍯).

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
- **Open Food Facts API**
- **Jest** pour les tests (`npx jest`)

## 📱 Installation

```bash
git clone https://github.com/Maeva-RODRIGUES/api-miel.git
cd api-miel
npm install
npx expo start
```
## 🧑‍💻 Contributrice

Développé avec amour par Maëva Rodrigues 💛
