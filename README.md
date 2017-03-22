# Fabriquer sa propre BlockChain avec NodeJS

## Objectif 
Fabriquer sa propre BlockChain en NodeJs en utilisant un process naïf et itératif : 

 * on met en place une solution simple
 * on observe ses failles
 * on corrige les failles et éventuellement on change tout
 * et on recommence

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
Comme nous reposons sur HTTP et que que nous voulons écrire le moins de code possible ("moins de code, moins de bugs !"), l'ordre sera transmis sous forme d'une requête GET avec du JSON dans le corps : 

	{ operation: "move", from: "1111", to: "2222", amount: 25 }

C'est un anti-pattern sémantique, mais ça se code facile avec NodeJs : 

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

Comme nous allons le voir, ça ne fonctionne pas du tout. Mais mettons cela de côté pour le moment.

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
  * Pour cela celle écrit un message : "moi Alice, propriétaire du compte 1234 je veux transférer 25 au compte 5678"
  * Elle chiffre son message avec sa clef privée
  * Elle envoie au réseau le message en clair et en chiffré 
  * Le réseau reçoit les deux versions et déchiffre la version chiffrée avec la clef publique de compte
  * Si le résultat du déchiffrage correspond à la version en clair, cela prouve que c'est bien Alice qui a écrit ce message avec sa clef privée.
  * Et donc qu'elle est bien propriétaire de ce compte et habilitée à en dépenser de l'argent
  
## Commandes 
Notre réseau est en place, notre base de données aussi, il reste à pouvoir faire des transferts d'argent.  
Nous partons du principe que chaque peer possède un seul compte et que seul son propriétaire peut transférer de l'argent. Un peer doit donc être en mesure de recevoir une commande lui disant d'opérer un transfert. Comme vu précédemment, nous allons utiliser le même port utilisé pour les échanges entre peers. Afin de simplifier ce projet, nous allons supposer que les commandes sont toujours issues par le propriétaire du peer en question.  
Si vous avions voulu protéger, nous aurions pu utiliser la sécurité des clefs asymétriques :
 
 * Au tout premier lancement, le peer génère une paire de clefs
 * Il stocke la clef publique
 * Le propriétaire garde précieusement sa clef privée
 * S'il veut envoyer une commande depuis une autre machine il l'envoie en deux versions : en clair, et chiffrée avec sa clef privée
 * Le peer reçoit l'ensemble et déchiffre la version chiffrée avec la clef publique
 * S'il obtient la même chose que la version en clair, c'est bien le propriétaire qui a lancé la commande. 

Niveau user-interface on fera de simple requête avec CURL à notre peer pour effectuer nos commandes :

	# Pour que le peer à l'écoute sur le port 5123
	# effectue un transfert depuis son compte vers le compte 1234 
	# pour un montant de 25
	curl 127.0.0.1:5123 --data '{"operation": "doTransaction", "accountId": "1234", "amount": 25}'

## Dépenser de l'argent
Le peer reçoit donc un ordre de transfert. Il vérifie dans sa version du livre que l'opération est possible : le compte destination existe-t'il ? les fonds sont-ils suffisants ?  
Si le transfert est valide, il est effectué dans son livre. Il lui reste alors à informer les noeuds du réseau qu'il a une nouvelle version à leur fournir. Evidemment, on ne va pas envoyer l'intégralité de la base de données : elle va s'alourdir avec le nombre d'utilisateurs jusqu'à très probablement devenir impraticable.  
On peut alors envoyer un diff/patch de la base. Ce qui revient en fait à envoyer une simple transaction ! 

Donc un peer reçoit une transaction, la valide et la renvoie au réseau, ie à tous ses peers.
Lorsqu'un peer reçoit une nouvelle transaction, il procède de la même façon. A bout du compte chacun à la même version du livre.

## Protéger le réseau
<!--On a une base de données distribuée qui contient des comptes : accountId, publicKey, balance.
Une node veut faire une transaction : 
 - elle modifie sa db locale et génère le hash de la db après modif
 - elle broadcast la transaction et le hash avec sa signature
Une node qui reçoit l'info vérifie avec la signature que c'est bien la node propriétaire du compte qui émet la transaction. 
Si oui, elle vérifie que l'opération est possible. 
Si oui, elle modifie sa version de la database et broadcast à son tour la transaction.-->

Dans notre système, si la majorité des nodes est dans les mains d'une seule personne, celle-ci peut modifier le livre à sa guise. Comment s'en protéger ?  
On va demander à chaque node de résoudre un problème idiot afin que le coût de maintenance d'un grand nombre de node soit trop important pour rendre l'opération rentable : c'est la *proof-of-work* (POW).  

La POW que l'on peut faire consiste à deviner un nombre. Pour cela on se base sur un hash. Par exemple, nous calculons le hash sur 16 bits de "Hello world" (Adler-16). Cela va donner un nombre allant de 0 à 65535.  
Nous allons ensuite modifier notre chaîne "Hello world" en une nouvelle chaîne dont nous allons espérer que le hash soit inférieur à une certaine valeur. Plus cette valeur est petite plus la difficulté est grande.  

**Exemple :**   
Nous décidons d'avoir une difficulté élevée, il faudra trouver un nombre compris entre 0 et 100 à partir du hash de "Hello world". Nous allons ajouter un nombre (nonce) à notre chaîne et hasher le résultat. Tant que la valeur du hash est plus grande que 100, on recommence en incrémentant le nombre :   
 * hash("Hello world0", 16) = 43393
 * hash("Hello world1", 16) = 43650
 * hash("Hello world2", 16) = 43907
 * ...
 * hash("Hello world592", 16) = 42 **BINGO !**


Dans le cas de notre blockchain, comment choisir le hash de départ et la difficulté ?  
Pour le hash on peut se baser sur n'importe quelle données instable dans le temps. Par exemple, la base de données elle-même. On la hash à chaque nouvelle modification et on se base sur cette valeur de départ pour trouver un nombre inférieur à notre base de difficulté.  

La difficulté doit être en adéquation avec la taille du réseau et la puissance mise à disposition par les technologies. On peut se base sur la taille de la base de données par exemple : on peut supposer que plus elle est importante, plus le réseau est grand.
