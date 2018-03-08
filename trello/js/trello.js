/*
 *
 * @author Annie Yin
 *
 */

// set up for Firebase
var config = {
    apiKey: "AIzaSyCOpKpuiilP3K2GwdXPgeCWXyyIp2b7s8A",
    authDomain: "trello-7944d.firebaseapp.com",
    databaseURL: "https://trello-7944d.firebaseio.com",
    projectId: "trello-7944d",
    storageBucket: "trello-7944d.appspot.com",
    messagingSenderId: "1080021306421"
};
  
// global access to initialized app database
var db = firebase.initializeApp(config).database();
// global reference to remote data
var listRef = db.ref('listData');
var userRef = db.ref('userData');
var categoryRef = db.ref('categoryData');
// connect Firebase to Vue
Vue.use(VueFire);

var app = new Vue ({
    el: '#app',
    data: {
        // listData: lists
        newCard: {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: []},
        newList: {name: '', cards: [], id: null},
        newUser: {name: '', email: '', image: '', id: null},
        newCategory: {name: '', color: ''},
        newName: '',
        userKey: '',
        clicked: 0
    },
    
    firebase: {
        listData: listRef,
        categoryData: categoryRef,
        userData: userRef
    },
    
    methods: {
        // add card to list
        // Firebase: DONE
        addCard: function (list) {
            var self = this;
            var modal = $('#add-modal');
            modal.css('display', 'block');
            // var list = parseInt(event.target.parentElement.parentElement.getAttribute('id'));
            
            // console.log(list);
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-card').off('click');
            $('#save-card').click(function () {
                modal.css('display', 'none');
                self.newCard.name = self.newCard.name.trim();
                // self.newCard.id = listRef.length;
                var today = new Date();
                self.newCard.dateCreated = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
                if (self.newCard.name) {
                    listRef.child(list['.key']).child('cards').once('value', function(snapshot) {
                        self.newCard.id = snapshot.numChildren();
                        // console.log(self.newCard.id);
                    })
                    
                    listRef.child(list['.key']).child('cards').push(self.newCard);
                    // self.listData[list].cards.push(self.newCard);
                }
                
                $('#add-modal').get(0).reset();
                $('.added-tasks').remove();
                self.newCard = {name: '', description: '', deadline: '', id: null, dateCreated: ''};
            });
        },
        
        // add task for a new card
        // No Firebase
        addTask: function () {
            var self = this;
            self.newCard.todos.push($('#add-task').val());
            var newTask = $('<li class="added-tasks">' + $('#add-task').val() + '</li>');
            newTask.css('color', 'darkgray');
            newTask.css('margin-top', '5px');
            $('ul').append(newTask);
            $('#add-task').val('');
        },
        
        // show card info in modal
        // Firebase: DONE
        showCard: function (list, index) {
            var self = this;
            var modal = $('#show-modal');
            modal.css('display', 'block');
            // var card = parseInt(event.currentTarget.getAttribute('id'));
            // var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));

            $('.close').off('click');
            $('.close').click(function () {
                $('#show-checklist').empty();
                $('#show-created').empty();
                modal.css('display', 'none');
            });
            
            var numTodos = null;
            
            listRef.child(list['.key']).child('cards').child(index).once('value', function(snapshot) {
                var card = snapshot.val();
                if ('todos' in card) numTodos = card['todos'].length;
                console.log(numTodos);
                
                $('#show-name').text(card['name']);
                $('#show-description').text(card['description']);
                // why does || not work??????
                if (numTodos != null) {
                    $('#show-checklist').append('<p style="color: darkgray; font-size: 17px; font-weight: bold; margin-bottom: 0;">Checklist: </p>');
                    for (var i = 0; i < numTodos; i++) {
                        var task = $('<div class="task-div"></div>');
                        task.css('display', 'flex');
                        task.css('flex-direction', 'row');
                        task.css('align-items', 'baseline');
                        task.css('margin', '0');
                        task.append($('<input style="width: 10%;" type="checkbox">'));
                        task.append($('<p style="margin-bottom: 0;">' + card['todos'][i] + '</p>'));
                        $('#show-checklist').append(task);
                    }
                }
                
                $('#show-deadline').text('Deadline: ' + card['deadline']);
                $('#show-datecreated').text('Date Created: ' + card['dateCreated']);
            });
        },
        
        // delete specific card from list
        // Firebase: DONE
        deleteCard: function (list, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            // var self = this;
            // var card = event.target.parentElement.parentElement.getAttribute('id');
            // var list = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('id');
            
            listRef.child(list['.key']).child('cards').child(index).remove();
        },
        
        // add list
        // Firebase: DONE
        addList: function () {
            var self = this;     
            self.newList.name = self.newList.name.trim();
            // self.newList.id = self.listData.length;
            
            if (self.newList.name) {
                listRef.once('value', function(snapshot) {
                    self.newList.id = snapshot.numChildren();
                    console.log(self.newList.id);
                });
                listRef.push(self.newList);
            }
            $('#list-input').val("");
            self.newList = {name: '', cards: [], id: null};
                
        },
        
        // add user (sign up)
        // Firebase: DONE
        addUser: function () { 
            var self = this;
            var modal = $('#add-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-user').off('click');
            $('#save-user').click(function () {
                modal.css('display', 'none');
                self.newUser.name = self.newUser.name.trim();
                self.newUser.email = self.newUser.email.trim();
                // self.newUser.id = self.userData.length;
                if (self.newUser.name && self.newUser.email) {
                    userRef.once('value', function(snapshot) {
                        self.newUser.id = snapshot.numChildren();
                    });
                    // self.userData.push(self.newUser);
                    userRef.push(self.newUser);
                }
                
                $('#add-user-modal').get(0).reset();
                self.newUser = {name: '', email: '', id: null};
            });
        },
        
        // check if user is already in system (log in)
        // Firebase: DONE
        checkUser: function () {
            var self = this;
            var modal = $('#sign-in-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#sign-in').off('click');
            $('#sign-in').click(function () {
                self.newUser.name = self.newUser.name.trim();
                self.newUser.email = self.newUser.email.trim();
                if (self.newUser.name && self.newUser.email) {
                    userRef.once('value', function(snapshot) {
                        for (key in snapshot.val()) {
                            userRef.child(key).once('value', function(snapshot) {
                                // console.log(snapshot.val());
                                var name = snapshot.val()['name'];
                                var email = snapshot.val()['email'];
                                if (self.newUser.name == name && self.newUser.email == email) {
                                    self.userKey = key;
                                    // console.log(self.userKey);
                                }
                            });
                        }
                    });
                    
                    if (self.userKey == '') {
                        var error = $('<p id="error">User not found. Please sign up!</p>');
                        error.css('text-align', 'center');
                        error.css('color', 'darkgray');
                        error.css('font-weight', 'bold');
                        $('#sign-in').replaceWith(error);
                        
                        $('.close').off('click');
                        $('.close').click(function () {
                            $('#error').replaceWith($('<p id="sign-in" class="save">Sign in</p>'))
                            modal.css('display', 'none');
                        });
                    } else {
                        modal.css('display', 'none');
                        $('#log-in').css('display', 'none');
                        $('#sign-up').css('display', 'none');
                        $('#change-info').css('display', 'block');
                    }
                } 
                
                $('#sign-in-modal').get(0).reset();
                self.newUser = {name: '', email: '', id: null};
            });
        },
        
        // change user profile
        // Firebase: DONE
        changeUserInfo: function () {
            var self = this;
            var modal = $('#change-user-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-changes').off('click');
            $('#save-changes').click(function () {
                modal.css('display', 'none');
                var newName = $('#new-username').val();
                var newEmail = $('#new-email').val();
                // self.userData[self.userIndex].name = newName;
                // self.userData[self.userIndex].email = newEmail;
                userRef.child(self.userKey).update({'name': newName, 'email': newEmail});
                modal.get(0).reset();
            });
        },
        
        // delete list
        // Firebase: DONE
        deleteList: function (list) {
            // var self = this;
            // var list = event.target.parentElement.parentElement.getAttribute('id');
            // console.log(list);
            // self.listData.splice(list, 1);
            listRef.child(list['.key']).remove();
        },
        
        // edit card name
        // Firebase: DONE
        editCardName: function (list, index) {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            // var card = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            // var list = parseInt(event.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('id'));
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                // var newName = $('#new-name').val();
                // self.listData[list].cards[card].name = newName;
                listRef.child(list['.key']).child('cards').child(index).update({'name': self.newName});
                self.newName = '';
            });
            
        },
        
        // edit list name
        // Firebase: DONE
        editListName: function (list) {
            var self = this;
            var modal = $('#rename-modal');
            modal.css('display', 'block');
            // var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-name').off('click');
            $('#save-name').click(function () {
                modal.css('display', 'none');
                // var newName = $('#new-name').val();
                // self.listData[list].name = newName;
                listRef.child(list['.key']).update({'name': self.newName});
                self.newName = '';
            });
            
        }, 
        
        // collapse list (don't show cards)
        // No Firebase
        collapseList: function (event) {
            var self = this;
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('#' + list.toString() + '.list').find($('.yo')).css('display', 'none');
        },
        
        // expand list (show cards)
        // No Firebase
        expandList: function (event) {
            var self = this;
            var list = parseInt(event.currentTarget.parentElement.parentElement.getAttribute('id'));
            
            $('#' + list.toString() + '.list').find($('.yo')).css('display', 'block');
        },
        
        // choose background color
        chooseBackgroundColor: function () {
            $('body').css('background-color', $('#background-color').val());
        },
        
        // choose background image
        // TODO: does not work
        chooseBackgroundImage: function () {
            console.log($('#background-image').val());
            // $('body').css('background-image', 'url("' + $('#background-image').val() + '")');
        },
        
        // filter cards by date 
        // to get all the cards again, just type in a future date
        // Firebase: DONE
        filterByDate: function () {
            var self = this;
            var dateInput = $('#filter-date').val();
            var x = dateInput.split('-');
            var enteredDate = new Date(x[2], x[0]-1, x[1]);
            $('.card').css('background-color', 'white');
            
            listRef.once('value', function(listSnapshot) {
                listSnapshot.forEach(function(listSnapshot) {
                    listSnapshot.child('cards').forEach(function(cardSnapshot) {
                        // console.log(cardSnapshot.val());
                        var card = cardSnapshot.val();
                        var y = card['dateCreated'].split('-');
                        var date = new Date(y[2], y[0]-1, y[1]);
                        if (date > enteredDate) {
                            cardSnapshot.ref.update({'show': false});
                        } else {
                            cardSnapshot.ref.update({'show': true});
                        }
                        // console.log(cardSnapshot.val());
                    });                        
                });
            });
            
            $('#filter-date').val('');
        },
    
        // filter cards by category 
        // Firebase: DONE
        filterByColor: function (category) {
            var self = this;
            var categoryName = '';
            categoryRef.once('value', function(snapshot) {
                // console.log(snapshot.val()); 
                categoryName = snapshot.val()[category['.key']]['name'];
                // console.log(categoryName);
            });
            
            listRef.once('value', function(listSnapshot) {
                listSnapshot.forEach(function(listSnapshot) {
                    listSnapshot.child('cards').forEach(function(cardSnapshot) {
                        // console.log(cardSnapshot.val());
                        var card = cardSnapshot.val();
                        // console.log(self.clicked);
                        if (self.clicked == 1) {
                            cardSnapshot.ref.update({'show': true});
                        } else {
                            if (!card['categories']) {
                                cardSnapshot.ref.update({'show': false});
                            }
                            else if (card['categories'].indexOf(categoryName) < 0) {
                                cardSnapshot.ref.update({'show': false});
                            }
                        }
                    });                        
                });
            });
            
            if (self.clicked == 1) {
                self.clicked = 0;
            } else {
                self.clicked = 1;
            }
            
        },
        
        // add category + choose its color
        // Firebase: DONE
        addCategory: function () {
            var self = this;
            
            var modal = $('#category-modal');
            modal.css('display', 'block');
            
            $('.close').off('click');
            $('.close').click(function () {
                modal.css('display', 'none');
            });
            
            $('#save-category').off('click');
            $('#save-category').click(function () {
                modal.css('display', 'none');
                // self.categoryData.push(self.newCategory);
                categoryRef.push(self.newCategory);
                //console.log(self.categoryData);
                $('#category-modal').get(0).reset();
                self.newCategory = {name: '', color: ''};
            });
            
        } 
    }
});
