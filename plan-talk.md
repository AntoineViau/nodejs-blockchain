1) Présentation

2) Pourquoi une BlockChain ?
 - un monde de tiers de confiance
 - définition d'une blockchain

3) Réseau P2P
 - NodeJs
 - peer
 - recherche des peers

4) Livre 101
 - comptes bancaires
 - un compte
 - compteur de transactions

5) Légitimité
 - Effectuer une virement : un cri d'amour vers le réseau
 - Problème de l'authentification traditionnelle
 - Crypto symétrique
 - Crypto asymétrique
 - Application : clef publique dans compte
 - Application : message chiffré avec clef privée

6) Problèmes conceptuels
 - le compteur de transaction et les incohérences spatio-temporelles dans le réseau P2P
 - problème : livre est un état global mutable
 - solution : immutabilité, un historique de l'état des comptes, fonctionne sur comptes distincts
 - problème : la double dépense quand N1 et N2 sont sur les mêmes comptes
 - solution : aller à la source de l'information, les transactions

7) Ecrire et protéger l'Histoire
 - rappel du fonctionnement : majoritaire, fork, confirmation
 - problème : Vilain peut modifier le livre
 - solution : figer le livre avec des hash
 - problème : Vilain a la mainmise sur le réseau
 - solution : preuve de travail

8) Scalabilité
 - une preuve de travai pour chaque transaction
 - rassembler les transactions : des blocs
 - chaîner les blocs comme on le faisait pour les transactions
 - résultat : une BlockChain.

 9) Présentation code

 10) Questions ?