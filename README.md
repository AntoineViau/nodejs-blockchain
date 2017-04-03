# Fabriquer sa propre BlockChain avec NodeJS

## Objectif 
Fabriquer sa propre BlockChain en NodeJs pour comprendre le comment et le pourquoi d'un tel système. Et pour cela, rien ne vaut le douloureux et magnifique cheminement du try-fail-fix-retry !

## Pourquoi une BlockChain ? 
Quand des entités (personnes, sociétés, administrations, etc.) s'entendent sur une relation entre elles, elle doivent généralement passer par un tiers de confiance.  
Exemple : transférer de l'argent d'une personne A à une personne B implique une banque en tant que tiers de confiance. A et B font confiance à la banque pour s'assurer que le transfert sera valide. La banque vérifiera les identités de A et B, le solde de B, procèdera au transfert, mettra à jour le compte de B, etc.  
Dans ce système le tiers détient un pouvoir considérable. Comment faire pour ne plus avoir à passer par un tiers ?  
Passer par une BlockChain !

## Principes de base d'une BlockChain 
Une BlockChain est **un grand livre** dans lequel tout le monde peut écrire. Ce qui est écrit fait office de vérité : comptes bancaires, contrats, cadastres, etc.  
Le livre est **partagé, maintenu et surveillé** non plus par un tiers, mais **par un réseau** constitué par tous ceux qui ont intérêt dans cette BlockChain. Cet intérêt peut provenir de diverses sources : opinions politiques, opportunités commerciales, rémunération, etc. Le livre est donc présent sur tous les noeuds du réseau. L'important est que tout le monde possède une même version valide, car c'est elle qui fera office de vérité. Une version différente (manipulée !) doit donc être rejetée par le réseau.  

Exemple de BlockChain sur contrat : la société A et la société B contractualisent une opération (vente, service, partenariat...). Le contrat est écrit et signé dans le livre par A, et si B est d'accord avec les termes, il le signe dans le livre. Le réseau s'occupe de s'assurer que :
 * A et B sont ceux qu'ils prétendent être
 * ni A, ni B, ni personne ne peut modifier le contrat

## Mise en pratique avec une monnaie
Une monnaie est juste une unité qui permet de réprésenter une valeur lié à des produits ou services. Nous utilisons la monnaie via des tiers de confiance imposés : les états et les banques. Les états créent la monnaie à leur guise : Banque Centrale Européenne, Federal Reserve américaine... Les banques commerciales fournissent les outils pour manipuler la monnaie : virements, chéquiers, cartes bancaires, mais aussi prêts, placements, etc.   

Comment faire pour se passer des états et des banques ?  
En les remplaçant par une BlockChain bien sûr !
Notre objectif est donc de pouvoir manipuler une monnaie au travers d'un grand livre partagé, maintenu et surveillé par un réseau. 

## Mise en place du réseau
Chaque machine du réseau possède une liste des autres machines (les _peers_) qu'elle connaît. Lors de son entrée sur le réseau, la liste de peers est vide. Nous utiliserons donc un _Peer Zero_ pour obtenir une première liste. Cela fait, notre machine se connectera aux peers, et récupèrera leurs listes. Et bien sûr, elle mettra à disposition sa propre liste.    
Pour se simplifier la vie en terme de connexions : 
* Utilisation du protocole HTTP.
* Afin de faire tourner le réseau sur une seule machine, on se connecte via les ports à partir du port 5000.

Donc pour lancer un peer : 

    node peer.js [port]

## Simuler une banque
Nous avons un réseau qui se maintient à peu près tout seul. A présent il nous faut le livre. Mais que mettre dedans ?
Notre approche naïve nous amène à simplement vouloir "faire la banque" telle que nous la connaissons.  
Nous écrirons donc des "comptes" dans le livre : 

 * un numéro d'identification
 * un solde

Une opération de transfert/paiement consistera donc en la modification de deux comptes.  
Par ailleurs, pour nous simplifier la vie chaque peer ne disposera que d'un seul compte.  
Pour réprésenter le livre il nous faut donc une base de données.  
A ce stade, un simple fichier JSON fera l'affaire : 

	[
		{ accountId: "12345", balance: 100},
		{ accountId: "98765", balance: 250},
		{ accountId: "49875", balance: 123},
	]

Transférer de l'argent consiste à envoyer un ordre au réseau. Il nous faut donc un protocole.
Comme nous reposons sur HTTP et que que nous voulons écrire le moins de code possible ("moins de code, moins de bugs !"), l'ordre sera transmis sous forme d'une requête POST avec du JSON dans le corps : 

	{ operation: "transaction", from: "1111", to: "2222", amount: 25 }

Ca se code facile avec NodeJs : 

    let port = 5000 + parseInt(global.id);
    http.createServer((req, res) => {
        var body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            let data = JSON.parse(body);
            switch (data.operation) {
				// ...
            }
        });
    }).listen(port);

## Synchronisation 
Nous voulons maintenir la même copie sur l'ensemble du réseau. Pour cela, les peers vont s'échanger en permanence l'état de leur livre. Quand un peer voit une version plus récente que la sienne, il la télécharge.  
Mais afin d'éviter la notion de temps pour déterminer la dernière version, on passe par un compteur de transactions plutôt qu'un timestamp. Notre base devient donc : 

	{
		nbTransactions: 42,
		accounts: [
			{ accountId: "12345", balance: 100},
			{ accountId: "98765", balance: 250},
			{ accountId: "49875", balance: 123},
		]
	}

**En pratique ça ne fonctionne pas du tout.  
Mais mettons cela de côté pour le moment et retenons que la version la plus récente est diffusée sur le réseau.**

## Authentification
Nous avons donc un réseau peer-to-peer et une base de données synchronisée. A présent, lorsque quelqu'un veut faire un transfert d'argent, il va modifier son compte et celui du destinataire. Comment s'assurer que celui qui provoque le transfert est bien le propriétaire du compte ?  
Avec un login et un mot de passe ?  
Mais qui va alors gérer la base de couples login/password ? Et où serait-elle stockée ?  
Il ne sert à rien de les mettre dans la même base que les comptes puisque c'est une base publique, partagée et synchronisée. Donc tout le monde connaîtrait les mots de passe. Et même si nous les hashons, ça resterait trop limite au niveau sécurité.  
Et bien sûr, confier la base à une entité tierce invalide totalement tout le concept de notre BlockChain décentralisée. 

La solution réside dans les principes de la cryptographie asymétrique : 

 * On crée deux clefs : A et B
 * Ce qui est chiffré avec A peut être déchiffré avec B
 * Et inversement, ce qui est chiffré avec B peut être déchiffré avec A

On peut donc décider d'avoir une clef connue par tout le monde - la *clef publique* - et une clef connue uniquement par son propriétaire - la *clef privée*. A partir de là, nous disposons d'une solution :

  * Au tout premier lancement d'un peer nous allons générer un couple clefs privée/publique et créé un compte
  * La clef publique va être stockée avec le compte dans la base (partagée et synchronisée)
  * Imaginons qu'Alice veut dépenser de l'argent de son compte
  * Pour cela celle écrit un message : *"moi Alice, propriétaire du compte 1234 je veux transférer 25 au compte 5678"*
  * Elle chiffre son message avec sa clef privée
  * Elle envoie au réseau le message en clair et en chiffré 
  * Le réseau reçoit les deux versions et déchiffre la version chiffrée avec la clef publique de compte
  * Si le résultat du déchiffrage correspond à la version en clair, cela prouve que c'est bien Alice qui a écrit ce message avec sa clef privée.
  * Et donc qu'elle est bien propriétaire de ce compte et habilitée à en dépenser de l'argent

On notera que ce système authentifie l'émetteur d'un ordre de virement, et qu'il protège aussi contre la falsification. Un Vilain est un peer, il reçoit la transaction et cherche à la modifier. Sans la clef privée il ne peut rien faire.
  
## Commandes 
Notre réseau est en place, notre base de données aussi, il reste à pouvoir faire des transferts d'argent.  
Nous partons du principe que chaque peer possède un seul compte et que seul son propriétaire peut transférer de l'argent. Un peer doit donc être en mesure de recevoir une commande lui disant d'opérer un transfert. 
Niveau user-interface il suffit de simples requêtes avec CURL :

	# Pour que le peer à l'écoute sur le port 5123
	# effectue un transfert depuis son compte vers le compte 567 
	# pour un montant de 25
	curl 127.0.0.1:5123 --data '{"operation": "transaction", "from": "123", "to": "567", "amount": 25}'

Le fichier `spend.js` permet de faire de même.

## Dépenser de l'argent
Le peer reçoit donc un ordre de transfert. Il vérifie dans sa version du livre que l'opération est possible : le compte destination existe-t'il ? les fonds sont-ils suffisants ?  
Si le transfert est valide, il est effectué dans son livre. Il lui reste alors à informer les noeuds du réseau qu'il a une nouvelle version à leur fournir. Evidemment, on ne va pas envoyer l'intégralité de la base de données : elle va s'alourdir avec le nombre d'utilisateurs jusqu'à très probablement devenir impraticable.  
On peut alors envoyer un diff/patch de la base. Ce qui revient en fait à envoyer une simple transaction ! 

Donc un peer reçoit une transaction, la valide et la renvoie au réseau, ie à tous ses peers.
Lorsqu'un peer reçoit une nouvelle transaction, il procède de la même façon. A bout du compte chacun à la même version du livre.

## Problèmes conceptuels
Nous n'avons pas encore traité sérieusement la synchronisation de la base de données. Compter les transactions est n'est absolument pas viable : notre réseau est  - par nature - asynchrone, et notre livre évolue. On a donc une double mutabilité : spatiale (le réseau) et temporelle (la base). Concrètement, à un moment donné un peer peut avoir 10 transactions, un autre peut aussi avoir 10 transactions, alors que ce ne sont pas (ou partiellement) les mêmes. Il y a deux états qui sont potentiellement impossible à fusionner.  
La source du problème vient du fait que nous voyons notre livre comme un état global et mutable : il évolue dans le temps et on perd son historique.  

On peut mettre de côté la mutabilité en rendant le livre immutable : les données ne sont pas modifiées, il n'y a que des ajouts. On stocke alors un historique de comptes bancaires :

    accountsHistory: [
        [ { id: "1", balance: 100}, { id: "2", balance: 100}, { id: "3", balance: 100}, ... ],
        [ { id: "1", balance: 120}, { id: "2", balance:  80}, { id: "3", balance: 100}, ... ],
        [ { id: "1", balance: 110}, { id: "2", balance:  80}, { id: "3", balance: 110}, ... ],
        ...
    ]

Dans ce système, les peers reçoivent les transactions, les appliquent à la dernière version du livre de leur historique. Ils peuvent ensuite échanger celui-ci avec le reste du réseau. Les peers ayant l'historique le plus important sont les référents pour les autres. Cela fonctionne à condition que les décalages entre les différentes partie du réseau ne concernent que des comptes différents : 

 * si A, B, C, D, E sont des comptes
 * si N1 est une sous-partie du réseau
 * si N2 est une autre sous-partie du réseau
 * N1 reçoit A->B, B->C et met à jour l'historique en conséquence 
 * N2 reçoit D->E et fait de même
 * quand N1 et N2 s'échangent leurs historiques, pas de problème : ils ne travaillent pas sur les mêmes comptes.
 
Mais si N2 reçoit A->C ? Et à quel moment ?  
On a alors un risque de double dépense : comme on ne connaît pas l'ordre des transactions, on ne sait dans quel ordre les appliquer. Le compte A peut se retrouver à transférer plus d'argent qu'il n'en possède. On pourrait ajouter un timestamp sur chaque version de l'historique ? Mais ça ne changerait rien puisque les diverses transactions qui génèrent l'historique arrivent à des moments différents.  
Les comptes bancaires ne sont que la finalité des transactions effectuées entre eux. A eux seuls ils ne fournissent pas assez d'information pour maintenir notre livre dans un état cohérent. Ces informations sont toutes contenues dans les transactions.    
En revanche, on peut donc déduire l'état des comptes à n'importe quel moment en additionnant les transactions.  
**Nous allons laisser tomber le stockage des comptes pour ne stocker que les transactions.**  

## Faire et protéger l'Histoire
Dans notre nouveau système il n'y a plus d'échange de livres. Les transactions sont envoyées sur le réseau et inscrites par chaque peer qui les valident. En cas de double dépense, une partie du réseau aura raison et l'autre tort. La partie la plus rapide va se répandre sur une plus grande surface et prendre le pas sur l'autre. Pour prendre un exemple :

 * le compte A possède 100 
 * il envoie 80 à B (transaction T1)
 * puis très vite 40 à C (transaction T2)

Imaginons que T1 se répande plus vite sur le réseau recouvre la surface N1 (sous-réseau). Tout peer qui proposera T2 à N1 se verra refuser cette transaction (plus assez de fond sur le compte A). La partie N2 qui avait accepté T2 va se trouver en minorité. Et elle va s'en rendre compte parce que N1 va continuer de recevoir de nouvelles transactions. N2 saura qu'elle est en retard en comptant le nombre de transactions, et devra donc abandonner ses propres transactions pour prendre celles de N1.  

Pour valider un tel fonctionnement, il faut ordonner les transactions.

Il nous faut protéger l'historique des transactions. En effet, à ce stade notre livre de transactions reste falsifiable par un Vilain et il n'y a pas moyen de la savoir. Il faut trouver un moyen pour qu'une modification de l'historique soit immédiatement repérée par les peers honnêtes.  
Pour cela, nous allons "verrouiller" l'historique en chaînant les transactions entre elles : 

 * la toute première transaction arrive sur le réseau :   
 `T0 = { operation: "transaction", from: "25", to: "30", amount: "100" }`
 * on calcule son hash :  
 `H0 = hash(T0)`
 * une nouvelle transaction T1 arrive :  
 `T1 = { operation: "transaction", from: "40", to: "50", amount: "12" }`
 * cette fois on calcule le hash de T1+H0 et on le stocke dans T1 :  
 `H1 = hash(T1+H0)`  
 `T1 = { hash: H1, operation: "transaction", from: "40", to: "50", amount: "12" }`
 * encore une transaction T2 :  
 `T2 = { operation: "transaction", from: "123", to: "456", amount: "789" }`
 `H2 = hash(T2+H1)`  
 `T2 = { hash: H2, operation: "transaction", from: "123", to: "456", amount: "789" }`
 * et on recommence pour les transactions suivantes...

On le voit, le hash de chaque nouvelle transaction dépend de la précédente, dont le hash dépend lui-même de la précédente, et ainsi de suite. 

## Le point sur les attaques possibles
Notre Vilain émet une transaction illégale (fonds insuffisants) et l'envoie sur le réseau. Chaque peer consulte son historique de transactions, reconstitue le solde du Vilain et constate l'illégalité : la transaction est refusée.

Le Vilain veut modifier une transaction qu'il a reçue. Comme la transaction est signée il ne peut pas la trafiquer. 

Le Vilain modifie sa version du livre. Pour cela il doit recalculer tous les hash de toutes les transactions à partir de celle qu'il a modifié. Il ré-écrit donc l'histoire à partir d'un certain moment. S'il détient une majorité du réseau il peut l'empoisonner progressivement pour que sa version du livre soit celle qui domine. Nous allons voir comment contrer cela.

Le Vilain joue l'asychronicité du réseau : il émet une première transaction, puis une seconde qui est illégale (fonds insuffisants). Une partie du réseau traite la première, une autre traite la seconde. Séparément ces transactions sont valides. Ensemble elles ne devraient pas passer : Alice possède 100, dépense 70 sur une transaction, puis 50 sur une seconde. Ce type d'attaque est appelée "double dépense".  
Elle ne pose problème que si l'on fait confiance trop tôt à un peer. En effet, l'une des deux transactions va se répandre plus vite que l'autre sur le réseau. En allant plus vite, et avec l'addition de nouvelles transactions, on trouvera une chaîne de transactions plus longue chez certains peers. Ca sera celle-ci qui fera office de vérité.  
L'attaque n'est effective que si on ne laisse pas le temps aux tentatives de double dépense d'être "absorbée" par le réseau.  
On remarque qu'un Vilain en possession d'une majorité du réseau est en mesure de faire des double dépenses.

## Protéger le réseau
Il faut protéger notre réseau d'une éventuelle mainmise sur une majorité de peers.  
Chaque fois qu'un peer veut modifier le livre (traiter une transaction) on va lui demander de résoudre un problème. Celui-ci doit être suffisamment coûteux en ressources afin que le coût de maintenance d'un grand nombre de peers soit trop important pour rendre l'opération rentable : c'est la *proof-of-work* (POW).  

Une POW possibile consiste à deviner un nombre. Pour cela on se base sur un hash. Par exemple, nous calculons le hash sur 16 bits de "Hello world". Cela va donner un nombre allant de 0 à 65535.  
Nous allons ensuite modifier notre chaîne "Hello world" en une nouvelle chaîne dont nous allons espérer que le hash soit inférieur à une certaine valeur. Plus cette valeur est petite plus la difficulté est grande.  

**Exemple :**   
Nous décidons d'avoir une difficulté élevée, il faudra trouver un nombre compris entre 0 et 100 à partir du hash de "Hello world". Nous allons ajouter un nombre (nonce) à notre chaîne et hasher le résultat. Tant que la valeur du hash est plus grande que 100, on recommence en incrémentant le nombre :   
 * hash("Hello world0") = 43393
 * hash("Hello world1") = 43650
 * hash("Hello world2") = 43907
 * ...
 * hash("Hello world592") = 42 **BINGO !**

Dans le cas de notre BlockChain, comment choisir le hash de départ et la difficulté ?  
Pour le hash on peut se baser sur n'importe quelle données instable dans le temps. Par exemple, la base de données elle-même. On la hash à chaque nouvelle modification et on se base sur cette valeur de départ pour trouver un nombre inférieur à notre repère de difficulté.  

La difficulté doit être en adéquation avec la taille du réseau et la puissance mise à disposition par les technologies. On peut utiliser la taille de la base de données par exemple : on peut supposer que plus elle est importante, plus le réseau est grand, plus il y a les ressources pour affronter la POW.

Un peer qui a résolu en premier la POW va pouvoir modifier le livre en ajoutant la transaction. Au passage il insère sa solution trouvée. Ce faisant, il sécurise encore plus notre BlockChain : chacun peut vérifier qu'il a effectivement fait la POW qui correspond à la transaction. 

## Les blocs
Dans notre système, chaque transaction doit être validée individuellement par une POW. Comme les transactions sont chaînées entre elles, nous avons une scalabilité catastrophique.  
Pour que notre réseau soit efficace, nous allons réunir les transactions dans des blocs. Une fois un bloc rempli, la POW est appliqué dessus, et on chaîne les blocs entre eux comme nous le faisions avec les transactions. Nous avons alors littéralement une chaîne de blocs : une *BlockChain*.