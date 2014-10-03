(function() {
    'use strict';

    window.App = {};

//==============================================================================
                                  //Views
//==============================================================================

    App.MenuItemView = Backbone.View.extend({
        tagName: 'li',
        className: 'menu-item',
    });

    App.MenuView = Backbone.View.extend({
        tagName: 'ul',
        className: 'menu',
        initialize: function() {
            $('main').append(this.el);
        }
    });


//==============================================================================
                                  //Models
//==============================================================================

    App.MenuItem = Backbone.Model.extend({
        initialize: function() {

        }
    });

//==============================================================================
                                  //Collections
//==============================================================================

    App.Menu = Backbone.Collection.extend({
        model: App.MenuItem,
    });

//==============================================================================
                                  //Glue
//==============================================================================

    $(document).ready(function() {
        var menu = new App.Menu(menuItems);
        var menuView = new App.MenuView({collection: menu});
        console.log(menuView);
    });

})();
















//
