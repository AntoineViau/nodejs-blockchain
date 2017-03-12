## Objectif 
Fabriquer sa propre blockchain en NodeJs en utilisant un process naïf et itératif : 

 * on met en place une solution simple
 * on observe ses failles
 * on corrige les failles et éventuellement on change tout
 * et on recommence

## Problème de base 
Quand des entités (personnes, sociétés, administrations, etc.) s'entendent sur une relation entre elles, elle doivent généralement passer par un tiers de confiance.  
Exemple : transférer de l'argent d'une personne A à une personne B implique une banque en tant que tiers de confiance. A et B font confiance à la banque pour s'assurer que le transfert sera valide. La banque vérifiera les identités de A et B, le solde de B, procèdera au transfert, mettra à jour le compte de B, etc.  
Dans ce système le tiers détient un pouvoir considérable. Comment faire pour ne plus avoir à passer par un tiers ?  
Passer par une blockchain !

## Principes de base d'une blockchain 
Une blockchain est **un grand livre** dans lequel tout le monde peut écrire. Ce qui est écrit fait office de vérité : comptes bancaires, contrats, cadastres, etc.  
Le livre est **partagé, maintenu et surveillé** non plus par un tiers, mais **par un réseau** constitué par tous ceux qui ont intérêt dans cette blockchain. Cet intérêt peut provenir de diverses sources : opinions politiques, opportunités commerciales, rémunération, etc. Le livre est donc présent sur tous les noeuds du réseau. L'important est que tout le monde possède une même version valide, car c'est elle qui fera office de vérité. Une version différente (manipulée !) doit donc être rejetée par le réseau.  

Exemple de blockchain sur contrat : la société A et la société B contractualisent une opération (vente, service, partenariat...). Le contrat est écrit et signé dans le livre par A, et si B est d'accord avec les termes, il le signe dans le livre. Le réseau s'occupe de s'assurer que :
 * A et B sont ceux qu'ils prétendent être
 * ni A, ni B, ni personne ne peut modifier le contrat

## Mise en pratique avec une monnaie
Une monnaie est juste unité qui permet de réprésenter une valeur lié à des produits ou services. Nous utilisons la monnaie via des tiers de confiance imposés : les états et les banques. Les états créent la monnaie à leur guise : Banque Centrale Européenne, Federal Reserve américaine... Les banques commerciales fournissent les outils pour manipuler la monnaie : virements, chéquiers, cartes bancaires, mais aussi prêts, placements, etc.   

Comment faire pour se passer des états et des banques ?  
En les remplaçant par une blockchain bien sûr !
Notre objectif est donc de pouvoir manipuler une monnaie au travers d'un grand livre partagé, maintenu et surveillé par un réseau. 

## Mise en place du réseau
Chaque machine du réseau possède une liste des autres machines (les _peers_) qu'elle connaît. Lors de son entrée sur le réseau, la liste de peers est vide. Nous utiliserons donc un _Peer Zero_ pour obtenir une première liste. Cela fait, notre machine se connectera aux peers, et récupèrera leurs listes. Et bien sûr, elle mettra à disposition de qui elle veut sa propre liste.    
Pour se simplifier la vie en terme de connexions réseau, nous passerons par le protocole HTTP et nous travaillerons en local avec des processus sur des ports différents à partir du port 5000.  Ainsi, le Peer Zero sera lancé sur le port 5000, et les peers suivant iront sur les ports suivants : 5001, 5016, 5789, etc. (pas forcément séquentiel).  
L'idée est de remplacer l'adresse IP par le port afin de pouvoir installer tout un réseau sur une seule machine avec une seule carte réseau.  
Donc pour lancer un peer : 

    node peer.js [port]







