import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { getUserListInterface } from 'src/app/interfaces/getUserList.interface';
import { CustomSocket} from './user-custom-socket';




@Injectable({
  providedIn: 'root'
})
export class UserSocketService{

  // socket! : CustomSocket
  constructor(
    private socket: CustomSocket,

) {}
  
  //cree un observable qui s'abonne a l'evement userList
  //des qu'il est mis a jour, la user list est mise a jour
  // il retourne un tableau de users mis a jour (next)
  getUserListUpdates(): Observable<getUserListInterface[]> {
    return new Observable<getUserListInterface[]>(
      observer => {
      this.socket.on('userList', (users: getUserListInterface[]) => 
        { observer.next(users) }
        );
    });
  }

  userUpdate$: Observable<getUserListInterface[]> = this.socket.fromEvent('userlist');

  //a appeler quand l'utilisateur change de status
  updateUserList(): void {
    this.socket.emit('updateUserList', {});
  }

  logout(){
    this.socket.emit('logout')
  }

  //  tres important pour eviter les memory leak
  // pour se desabonner des ecoutes
  onDestroy()
  {
    this.socket.removeAllListeners()
  }
}

// Explications de bard :
// La méthode getUserListUpdates() est une fonction qui retourne un Observable d'un tableau d'interfaces getUserListInterface.
// Cette fonction crée un nouvel Observable et lui passe un observer en argument.
// L'observateur est un objet qui possède une méthode next().

// À l'intérieur de l'observable, la méthode on() du socket est appelée avec l'événement userList.
// Lorsque cet événement est reçu, la méthode next() de l'observateur est appelée avec le tableau d'utilisateurs reçu en argument.

// Cela signifie que chaque fois que l'événement userList est reçu,
// l'observable émettra une nouvelle valeur, qui sera le tableau d'utilisateurs actuel.

// La propriété userUpdate$ est un Observable qui est créé en appelant la méthode fromEvent() du socket avec l'événement userlist. 
// Cela crée un observable qui émettra une valeur chaque fois que l'événement userlist est reçu,
// car la méthode fromEvent() crée un observable qui émet une valeur chaque fois que l'événement spécifié est reçu.

// En résumé, la méthode getUserListUpdates() crée un observable qui émet une nouvelle valeur chaque fois que la liste des utilisateurs est mise à jour.
// La propriété userUpdate$ est un observable qui émet une valeur chaque fois que l'événement userlist est reçu.