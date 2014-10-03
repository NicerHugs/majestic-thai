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
            this.$container.append(this.el);
        }
    });

    App.MenuItemView = App.BaseView.extend({
        tagName: 'li',
        className: 'menu-item',
    });

    App.MenuView = App.BaseView.extend({
        tagName: 'ul',
        className: 'menu',
        initialize: function(options) {
            options = options || {};
            this.$container = options.$container || $('main');
            this.$container.append(this.el);
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
    });

})();
















//
