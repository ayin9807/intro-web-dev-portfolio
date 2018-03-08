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
// global reference to remote storage
var storageRef = firebase.storage().ref();
// global reference to remote data
var listRef = db.ref('listData');
var userRef = db.ref('userData');
var categoryRef = db.ref('categoryData');
var backgroundRef = db.ref('background');
db.ref('background').once('value', function(snapshot) {
    console.log(snapshot.val().name);
    $('#app').css('background-color', snapshot.val().name);
});
// connect Firebase to Vue
Vue.use(VueFire);

var app = new Vue ({
    el: '#app',
    data: {
        // listData: lists
        newCard: {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: [], show: true},
        newList: {name: '', cards: [], id: null},
        newUser: {name: '', email: '', image: '', id: null},
        newCategory: {name: '', color: ''},
        newName: '',
        userKey: '',
        clicked: 0,
        changed: 0
    },
    
    firebase: {
        listData: listRef,
        categoryData: categoryRef,
        userData: userRef,
        background: backgroundRef
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
                if (self.newCard.name) {
                    var today = new Date();
                    self.newCard.dateCreated = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
                    listRef.child(list['.key']).child('cards').once('value', function(snapshot) {
                        self.newCard.id = snapshot.numChildren();
                        // console.log(self.newCard.id);
                    })
                    
                    /*var image = document.getElementById('card-files');
                    // console.log(image.files);
                    if (image.files.length > 0) {
                        var file = image.files;
                        // console.log(file);
                        var allURLs = [];
                        for (var i = 0; i < file.length; i++) {
                            console.log(file[i]);
                            storageRef.child('images/' + file[i].name).put(file[i]).then(function(snapshot) {
                                console.log(allURLs);
                                allURLs.push(snapshot.downloadURL);    
                            });
                        }
                        console.log(allURLs);
                    }*/
                    
                    /*if (i == (file.length-1)) {
                        listRef.child(list['.key']).child('cards').push({
                            name: self.newCard.name,
                            description: self.newCard.description, 
                            deadline: self.newCard.deadline, 
                            id: self.newCard.id, 
                            dateCreated: self.newCard.dateCreated, 
                            images: allURLs, 
                            todos: self.newCard.todos, 
                            categories: self.newCard.categories, 
                            show: true
                        });
                    }*/
                    
                     listRef.child(list['.key']).child('cards').push(self.newCard);
                    // self.listData[list].cards.push(self.newCard);
                }
                
                // console.log(self.newCard.categories);
                
                $('#add-modal').get(0).reset();
                $('.added-tasks').remove();
                self.newCard = {name: '', description: '', deadline: '', id: null, dateCreated: '', images: [], todos: [], categories: [], show: true};
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
                // console.log(numTodos);
                
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
                var name = self.newUser.name.trim();
                var email = self.newUser.email.trim();
                var id = null;
                // self.newUser.id = self.userData.length;
                if (self.newUser.name && self.newUser.email) {
                    userRef.once('value', function(snapshot) {
                        id = snapshot.numChildren();
                    });
                    
                    var image = document.getElementById('user-files');
                    // console.log(image.files);
                    if (image.files.length > 0) {
                        var file = image.files[0];
                        console.log(file);
                        storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                            self.newUser.image = snapshot.downloadURL;
                            self.newUser.name = name;
                            self.newUser.email = email;
                            self.newUser.id = id;
                            userRef.push(self.newUser);
                        });
                        // console.log(url);
                    }
                    // self.userData.push(self.newUser);
                }
                
                $('#add-user-modal').get(0).reset();
                self.newUser = {name: '', email: '', image: '', id: null};
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
                        userRef.child(self.userKey).once('value', function(snapshot) {
                            var image = $('<img id="user-header-image" src=' + snapshot.val()['image'] + ' >')
                            image.css('height', '50px');
                            image.css('width', '35px');
                            image.css('border-radius', '10%');
                            $('#user-header').append(image); 
                        });
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
                var image = document.getElementById('user-change-files');
                // console.log(image.files);
                if (image.files.length > 0) {
                    var file = image.files[0];
                    console.log(file);
                    storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                        userRef.child(self.userKey).update({'image': snapshot.downloadURL});
                        $('#user-header-image').remove();
                        var image = $('<img id="user-header-image" src=' + snapshot.downloadURL + ' >')
                        image.css('height', '50px');
                        image.css('width', '35px');
                        image.css('border-radius', '10%');
                        $('#user-header').append(image);    
                    });
                    // console.log(url);
                }
                
                if (newName) userRef.child(self.userKey).update({'name': newName});
                
                if (newEmail) userRef.child(self.userKey).update({'email': newEmail});
                
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
        // Firebase: DONE
        chooseBackgroundColor: function () {
            $('#app').css('background-image', 'none');
            $('#app').css('background-color', $('#background-color').val());
            backgroundRef.update({'name': $('#background-color').val()});
            $('#background-color').val('');
        },
        
        // choose background image
        // TODO: does not work
        chooseBackgroundImage: function () {
            // console.log($('#background-image').val());
            
            var image = document.getElementById('card-files');
            // console.log(image.files);
            if (image.files.length > 0) {
                var file = image.files[0];
                console.log(file);
                storageRef.child('images/' + file.name).put(file).then(function(snapshot) {
                    $('#app').css('background-image', 'url("' + snapshot.downloadURL + '")');
                    backgroundRef.update({'name': snapshot.downloadURL});
                });
                // console.log(url);
            }
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
            
        }, 
        
        changeOrientation: function () {
            console.log('hi');
            if (self.changed == 0) {
                console.log('column');
                $('#not-header').css('flex-direction', 'column');
                $('.list').css('flex-direction', 'row');
                $('.yo').css('display', 'flex');
                $('.yo').css('flex-direction', 'row');
                $('.yo').css('align-content', 'baseline');
                self.changed = 1;
            } else {
                console.log('row');
                $('#not-header').css('flex-direction', 'row');
                $('.list').css('flex-direction', 'column');
                $('.yo').css('display', 'block');
                self.changed = 0;
            }
        }
    }
});
