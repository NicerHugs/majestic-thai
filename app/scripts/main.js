(function() {
    'use strict';

    window.App = {};

//==============================================================================
                                  //Views
//==============================================================================

    App.BaseView = Backbone.View.extend({
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container || $('main');
            this.$template = options.$template;
            this.render();
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change', this.render);
        },
        template: function() {
            return _.template(this.$template.text());
        },
    });

//Single item view on the menu's view
    App.MenuItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item',
        template: _.template($('#menu-item-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        }
    });

//Single item view on the orderable menu
    App.OrderMenuItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item',
        template: _.template($('#order-menu-item-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        },
        events: {
            'click h3': 'selectItemOptions'
        },
        selectItemOptions: function(e) {
            e.preventDefault();
            var itemOptions = new App.OrderItemOptionsView({
                model: this.model,
            });
        }
    });

//An individual menu item's options, used to get user's desired options when
//user tries to add the item to their order
    App.OrderItemOptionsView = App.BaseView.extend({
        className: 'order-item-options',
        template: _.template($('#order-item-options-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
            this.renderOptions();
        },
        events: {
            'click .cancel-item' : 'cancelItemAdd'
        },
        cancelItemAdd: function(e) {
            e.preventDefault();
            this.remove();
        },
        renderOptions: function() {
            if (this.model.get('vegan')) {
                var veganOption = new App.ItemOptionView({
                    model: this.model,
                    $container: this.$el.find('form'),
                    $template: $('#vegan-option-template')
                });
            }
            if (this.model.get('spice')) {
                var spiceOption = new App.ItemOptionView({
                    model: this.model,
                    $container: this.$el.find('form'),
                    $template: $('#spice-option-template')
                });
            }
            if (this.model.get('meat')) {
                var meatOption = new App.ItemOptionView({
                    model: this.model,
                    $container: this.$el.find('form'),
                    $template: $('#meat-option-template')
                });
            }
        }
    });

//the options views for each of an item's available options (inserted into
//item-options view)
    App.ItemOptionView = App.BaseView.extend({
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container;
            this.$template = options.$template;
            this.render();
        },
        render: function() {
            this.$container.prepend(this.template(this.model));
        }
    });

//Any reference to the entire menu's view
    App.MenuView = App.BaseView.extend({
        tagName: 'section',
        className: 'menu',
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container || $('main');
            this.$template = options.$template;
            this.render();
        },
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.collection));
        },
        events: {
            'click h2 a'          : 'expandMenu',
            'click button'        : 'closeMenu',
            'click .order-button' : 'startNewOrder'
        },
        expandMenu: function(e) {
            e.preventDefault();
            var that = this;
            this.$el.find('.order-button').removeClass('hidden');
            this.$el.find('button').removeClass('hidden');
            this.$el.find('ul').html('');
            _.each(this.collection.models, function(model) {
                that.renderMenuItem(model, that);});
        },
        //render a menuItemView and put it inside the ul of this view.
        renderMenuItem: function(model, parent) {
            var newItemView = new App.MenuItemView({
                model: model,
                $container: parent.$el.find('ul'),
            });
            newItemView.render();
        },
        renderOrderMenuItem: function(model, parent) {
            var newItemView = new App.OrderMenuItemView({
                model: model,
                $container: parent.$el.find('ul'),
            });
            newItemView.render();
        },
        //closes the expanded menu.
        closeMenu: function(e) {
            e.preventDefault();
            $(e.target).addClass('hidden');
            this.$el.find('.order-button').addClass('hidden');
            this.$el.find('ul').html('');
        },
        startNewOrder: function(e) {
            e.preventDefault();
            var that = this;
            this.$el.find('ul').html('');
            _.each(this.collection.models, function(model) {
                that.renderOrderMenuItem(model, that);});
            var newOrder = new App.Order();
            var workingOrder = new App.WorkingOrderView({
                model: newOrder,
                $container: $('main'),
                $template: $('#new-order-template')
            });
        },
        openUserLogin: function(e) {
            e.preventDefault();
            new App.UserLoginView({
                model: new App.User(),
                $container: this.$el,
                $template: $('#user-login-template')
            });
        }
    });

//working order view is where a working order is displayed until it is sent to
//the server
    App.WorkingOrderView = App.BaseView.extend({
        className: 'working-order',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model));
        }
    });


//user login (popup) view
    App.UserLoginView = App.BaseView.extend({
        className: 'user-login',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model));
        },
        events: {
            'click .cancel-login'   : 'cancelLogin',
            'click #new-user-login' : 'openNewUserForm'
        },
        cancelLogin: function(e) {
            e.preventDefault();
            this.remove();
        },
        openNewUserForm: function(e) {
            e.preventDefault();
            new App.NewUserView({
                model: this.model,
                $container: this.$el.parent(),
                $template: $('#new-user-template')
            });
            this.remove();
        }
    });

//new user login (create acct)
    App.NewUserView = App.BaseView.extend({
        className: 'user-login',
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model));
        },
        events: {
            'click .cancel-login'               : 'cancelAcctCreation',
            'keyup #new-user-password-validate' : 'validatePassword',
            'submit'                            : 'makeNewUser'
        },
        cancelAcctCreation: function(e) {
            e.preventDefault();
            new App.UserLoginView({
                model: this.model,
                $container: this.$el.parent(),
                $template: $('#user-login-template')
            });
            this.remove();
        },
        validatePassword: function(e) {
            if ($('#new-user-password').val() !== $('#new-user-password-validate').val()) {
                $('#new-user-password-validate').addClass('invalid');
                return false;
            }
            else {
                $('#new-user-password-validate').removeClass('invalid');
                return true;
            }
        },
        makeNewUser: function(e) {
            e.preventDefault();
            if (this.validatePassword()) {
                var users = new App.Users();
                var newUser = users.create({
                    name: $('#new-user-name').val(),
                    address: $('#new-user-addr').val(),
                    zipcode: $('#new-user-zip').val(),
                    email: $('#new-user-email').val(),
                    phone: $('#new-user-phone').val(),
                    password: $('#new-user-password').val()
                });
                console.log(users.get(newUser.id));
            }
        }
    });

//homepage contact/loctation information's view
    App.InfoView = App.BaseView.extend({
        tagName: 'section',
        className: 'info',
        template: _.template($('#homepage-info-template').text()),
        render: function() {
            this.$container.append(this.el);
            this.$el.html(this.template(this.model.attributes));
        }
    });


//==============================================================================
                                  //Models
//==============================================================================

//Any single menu item
    App.MenuItem = Backbone.Model.extend({

    });

//All contact and location information about the restaurant
    App.Info = Backbone.Model.extend({
        defaults: {
            weekdayHrs: '12-9pm',
            weekendHrs: '12pm-1am',
            sundayHrs: '10am-9pm'
        }
    });

//A single user
    App.User = Backbone.Model.extend({
        defaults: {
        }
    });

//A single order
    App.Order = Backbone.Model.extend({

    });



//==============================================================================
                                  //Collections
//==============================================================================

//The collection of menu-item models
    App.Menu = Backbone.Firebase.Collection.extend({
        model: App.MenuItem,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/menuItems"
    });

//The collection of users
    App.Users = Backbone.Firebase.Collection.extend({
        model: App.User,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/users"
    });

//The collections of orders
    App.Orders = Backbone.Firebase.Collection.extend({
        model: App.Order,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/orders"
    });


//==============================================================================
                                  //Glue
//==============================================================================

    $(document).ready(function() {
        var menu = new App.Menu();
        var homeMenuView = new App.MenuView({
            collection: menu,
            $template: $('#homepage-menu-template')
        });
        var info = new App.Info({
        });
        var homeInfoView = new App.InfoView({
            model: info,
            $template: $('#homepage-info-template')
        });
    });

})();
















//
