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
            this.listenTo(this.model, 'change', this.render)
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
            'click h2 a': 'expandMenu',
            'click button' : 'closeMenu',
            'click .order-button' : 'openUserLogin'
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
                $template: $('#menu-item-template')
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
        openUserLogin: function(e) {
            e.preventDefault();
            new App.UserLoginView({
                model: new App.User(),
                $container: this.$el,
                $template: $('#user-login-template')
            });
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
            'click .cancel-login': 'cancelLogin',
            'click #new-user-login': 'openNewUserForm'
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
            'click .cancel-login': 'cancelAcctCreation',
        },
        cancelAcctCreation: function(e) {
            e.preventDefault();
            new App.UserLoginView({
                model: this.model,
                $container: this.$el.parent(),
                $template: $('#user-login-template')
            });
            this.remove();
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



//==============================================================================
                                  //Collections
//==============================================================================

//The collection of menu-item models
    App.Menu = Backbone.Firebase.Collection.extend({
        model: App.MenuItem,
        firebase: "https://sweltering-heat-7867.firebaseio.com/MajesticThai/menuItems"
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
