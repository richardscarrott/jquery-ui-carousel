// assumes fixture:
//     - contains 9 items
//     - items are 100px x 100px
//     - root is 500px wide
//          - so, by default, will have 2 pages - [jQuery(li, li, li, li, li), jQuery(li, li, li, li)]

// config
jasmine.getFixtures().fixturesPath = 'tests/spec/fixtures/html';
jasmine.getStyleFixtures().fixturesPath = 'tests/spec/fixtures/css';

describe('The carousel', function () {

    var root,
        rootWithMask,
        rootNested,
        rootNestedChild;

    beforeEach(function () {
        loadFixtures('carousel.html', 'carousel-with-mask.html', 'carousel-nested.html');
        loadStyleFixtures('style.css');
        root = $('#rs-carousel');
        rootWithMask = $('#rs-carousel-with-mask');
        rootNested = $('#rs-carousel-nested');
        rootNestedChild = $('#rs-carousel-nested-child');

        this.addMatchers({
            toBeArray: function () {
                return $.type(this.actual) === 'array';
            },
            toBe$Obj: function () {
                return this.actual instanceof $;
            }
        });
    });

    // given the root el this returns the instance (supporting both the WFs 1.8 and 1.9 api)
    var getInstance = function (root) {
        return root.data('rsCarousel') || root.data('carousel');
    };

    // returns position of runner element - `.rs-carousel-runner`
    var getPos = function (root, dir) {
        dir = dir || 'left';
        return getInstance(root).elements.runner.position()[dir];
    };

    describe('mark-up', function () {

        // checks for `.rs-carousel > .rs-carousel-mask > .rs-carousel-runner > .rs-carousel-item` + `ol.rs-carousel-pagination > li.rs-carousel-pagination-link`
        // + `a.rs-carousel-action-next` + `> a.rs-carousel-action-prev`
        var hasCorrectMarkup = function (root) {
            var carousel = root.is('.rs-carousel') && root.find('> .rs-carousel-mask > .rs-carousel-runner > .rs-carousel-item').length,
                pagination = root.find('> ol.rs-carousel-pagination > li.rs-carousel-pagination-link').length,
                next = root.find('> a.rs-carousel-action-next').length,
                prev = root.find('> a.rs-carousel-action-prev').length;

            return carousel && pagination && next && prev;
        };

        it('should match `.rs-carousel > .rs-carousel-mask > .rs-carousel-runner > .rs-carousel-item` + `ol.rs-carousel-pagination > li.rs-carousel-pagination-link` + `a.rs-carousel-action-next` + `> a.rs-carousel-action-prev`', function () {
            expect(hasCorrectMarkup(root.carousel())).toBeTruthy();
        });

        it('should be the same even when the mask already exists in the initial mark-up', function () {
            expect(hasCorrectMarkup(rootWithMask.carousel())).toBeTruthy();
        });

        it('should be the same even when nesting carousels', function () {
            rootNested.carousel();
            rootNestedChild.carousel();

            // check mark-up *after* both instances have been instantiated to ensure
            // the tests accounts for the parent messing with the child's mark-up and
            // vice versa.
            expect(hasCorrectMarkup(rootNested)).toBeTruthy();
            expect(hasCorrectMarkup(rootNestedChild)).toBeTruthy();
        });

        it('should contain the correct state classNames', function () {
            var elements;
            root.carousel();
            elements = getInstance(root).elements;

            // root
            expect(root).toHaveClass('rs-carousel-horizontal');
            expect(root).not.toHaveClass('rs-carousel-disabled');

            // next action
            expect(elements.nextAction).toHaveClass('rs-carousel-action-active');
            expect(elements.nextAction).not.toHaveClass('rs-carousel-action-disabled');

            // prev action
            expect(elements.prevAction).not.toHaveClass('rs-carousel-action-active rs-carousel-action-disabled');

            // pagination
            expect(elements.pagination).not.toHaveClass('rs-carousel-pagination-disabled');
            expect(elements.pagination.find('.rs-carousel-pagination-link:first')).toHaveClass('rs-carousel-pagination-link-active');

            // items
            expect(root.carousel('getPage')).toHaveClass('rs-carousel-item-active');
        });

        it('should contain the correct state classNames when disabled', function () {
            var elements;
            root.carousel();
            elements = getInstance(root).elements;
            root.carousel('disable');

            // root
            expect(root).toHaveClass('rs-carousel-disabled');

            // next action
            expect(elements.nextAction).toHaveClass('rs-carousel-action-disabled');

            // prev action
            expect(elements.prevAction).toHaveClass('rs-carousel-action-disabled');

            // pagination
            expect(elements.pagination).toHaveClass('rs-carousel-pagination-disabled');
        });

    });

    describe('should fire the following events', function () {

        it('create', function () {
            var spy = jasmine.createSpy('createHandler');
            root.on('carouselcreate', spy);
            root.carousel({ create: spy });
            expect(spy.callCount).toEqual(2);
        });

        it('should be called', function () {
            var spy = jasmine.createSpy('beforeHandler');
            root.on('carouselbefore', spy);
            root.carousel({ before: spy });
            root.carousel('next');
            expect(spy.callCount).toEqual(2);
        });

        // rather than doing this async it might make sense to simply turn
        // off jQuery fx's - `jQuery.fx.off = true` or set the speed to 0
        it('after', function () {
            var spy;
            
            runs(function () {
                spy = jasmine.createSpy('afterHandler');
                root.on('carouselafter', spy);
                root.carousel({ after: spy, speed: 1 });
                root.carousel('next');
            });

            // NOTE: this won't ever catch errors whereby the event is 
            // called more than twice as it bails at 2 calls.
            waitsFor(function () {
                return spy.callCount === 2;
            }, 'the spy to be called 2 times', 500);

            runs(function () {
                expect(spy.callCount).toEqual(2);
            });
        });

    });

    describe('method', function () {

        describe('goToPage', function () {

            it('should slide the carousel to the given page', function () {
                var originalPos;
                root.carousel({ speed: 0 }); // set speed to 0 so this is no longer async
                originalPos = getPos(root);
                root.carousel('goToPage', 1);   
                expect(root.carousel('getIndex')).toEqual(1);
                expect(getPos(root)).not.toEqual(originalPos);
            });

            it('shouldn\'t slide if the `before` callback returns false', function () {
                var instance,
                    originalPos;
                root.carousel({
                    speed: 0, // sync
                    before: function () {
                        return false;
                    }
                });
                originalPos = getPos(root);
                root.carousel('next');
                expect(root.carousel('getIndex')).toEqual(0);
                expect(getPos(root)).toEqual(originalPos);
            });

            it('should update the ui', function () {
                var spy;
                root.carousel();
                spy = spyOn($.rs.carousel.prototype, '_updateUi');
                root.carousel('goToPage', 1);
                expect(spy).toHaveBeenCalled();
            });

            it('should set the event type to carousel:gotopage', function () {
                root.carousel({
                    before: function (e) {
                        expect(e.originalEvent.type).toEqual('carousel:gotopage');
                    },
                    after: function (e) {
                        expect(e.originalEvent.type).toEqual('carousel:gotopage');
                    },
                    speed: 0
                });
                root.carousel('goToPage', 1);
            });

        });
        
        describe('next', function () {

            it('should go to the next page', function () {
                var spy,
                    args;
                root.carousel();
                spy = spyOn($.rs.carousel.prototype, 'goToPage').andCallThrough();
                root.carousel('next');
                expect(spy).toHaveBeenCalled();
                expect(root.carousel('getIndex')).toEqual(1);
            });

            it('should set the event type to carousel:next', function () {
                root.carousel({
                    before: function (e) {
                        expect(e.originalEvent.type).toEqual('carousel:next');
                    },
                    after: function (e) {
                        expect(e.originalEvent.type).toEqual('carousel:next');
                    },
                    speed: 0
                });
                root.carousel('next');
            });

        });

        describe('prev', function () {

            it('should go to the previous page', function () {
                var spy,
                    args;
                root.carousel().carousel('next'); // make sure prev will actually do something
                spy = spyOn($.rs.carousel.prototype, 'goToPage').andCallThrough();
                root.carousel('prev');
                args = spy.mostRecentCall.args || [];
                expect(spy).toHaveBeenCalled();
                expect(root.carousel('getIndex')).toEqual(0);
            });

            it('should set the event type to carousel:prev', function () {
                root.carousel({
                    before: function (e) {
                        expect(e.originalEvent.type).toEqual('carousel:prev');
                    },
                    after: function (e) {
                        expect(e.originalEvent.type).toEqual('carousel:prev');
                    },
                    speed: 0
                });
                root.carousel('goToPage', 1, null, null, true); // make sure prev will actually do something (and it's silent)
                root.carousel('prev');
            });

        });

        describe('goToItem', function () {

            var spy;

            beforeEach(function () {
                root.carousel();
                spy = spyOn($.rs.carousel.prototype, 'goToPage').andCallThrough();
            });

            it('should go to the page containing the given item (Number)', function () {
                root.carousel('goToItem', 8);
                expect(spy).toHaveBeenCalled();
                expect(root.carousel('getIndex')).toEqual(1);
            });

            it('should go to the page containing the given item (jQuery object)', function () {
                root.carousel('goToItem', root.find('.rs-carousel-item').eq(8));
                expect(spy).toHaveBeenCalled();
                expect(root.carousel('getIndex')).toEqual(1);
            });

            it('should go to the page containing the given item (DOM element)', function () {
                root.carousel('goToItem', root.find('.rs-carousel-item').eq(8).get(0));
                expect(spy).toHaveBeenCalled();
                expect(root.carousel('getIndex')).toEqual(1);
            });

        });

        describe('getPages', function () {

            it('should return an array of jQuery objects representing the items in the page', function () {
                var pages;
                root.carousel();
                pages = root.carousel('getPages');
                expect(pages).toBeArray();
                expect(pages[0]).toBe$Obj();
                expect(pages[0].length).toEqual(5);
            });

        });

        describe('getPage', function () {

            it('should return a jQuery object representing the items in the current page', function () {
                var page;
                root.carousel();
                page = root.carousel('getPage');
                expect(page).toBe$Obj();
                expect(page.length).toEqual(5);
            });

            it('should return a jQuery object representing the items in the page matched by the page index argument', function () {
                var page;
                root.carousel();
                page = root.carousel('getPage', 1); // zero based
                expect(page).toBe$Obj();
                expect(page.length).toEqual(4);
            });

        });

        describe('getIndex', function () {

            it('should return the current page\'s index', function () {
                root.carousel();
                expect(root.carousel('getIndex')).toEqual(0);
            });

        });

        describe('getPrevIndex', function () {

            it('should return the previous pages\'s index', function () {
                root.carousel().carousel('next');
                expect(root.carousel('getPrevIndex')).toEqual(0);
            });

        });

        describe('getNoOfPages', function () {

            it('should return the number of pages', function () {
                root.carousel();
                expect(root.carousel('getNoOfPages')).toEqual(2);
            });

        });

        describe('getNoOfItems', function () {

            it('should return the number of items', function () {
                root.carousel();
                expect(root.carousel('getNoOfItems')).toEqual(9);
            });

        });

        describe('add', function () {

            it('should add the passed in `items`', function () {
                root.carousel();
                root.carousel('add', $('<li>10</li><li>11</li>'));
                expect(root.carousel('getNoOfItems')).toEqual(11);
            });

        });

        describe('remove', function () {

            it('should remove the items matched by the `selector`', function () {
                root.carousel();
                root.carousel('remove', '.rs-carousel-item:last');
                expect(root.carousel('getNoOfItems')).toEqual(8);
            });

        });

    });

    describe('option', function () {

        describe('itemsPerTranstion:2', function () {

            it('should force the number of items per transition (regardless of mask and item width)', function () {
                var pages;
                root.carousel({
                    itemsPerTransition: 2
                });
                pages = root.carousel('getPages');
                // expect: [jQuery(li, li), jQuery(li, li), jQuery(li, li, li, li, li)]
                expect(pages.length).toEqual(3);
                expect(pages[0].length).toEqual(2);
                // given the mask width of 500px and an item width of 100px the last page
                // contains the remainder
                expect(pages[2].length).toEqual(5);
            });

            it('#37 should allow a string value', function () {
                root.carousel({
                    itemsPerTransition: '2'
                });
                expect(root.carousel('getNoOfPages')).toEqual(3);
            });

        });

        describe('orientation:vertical', function () {

            beforeEach(function () {
                root.carousel({
                    speed: 0,
                    orientation: 'vertical'
                });
            });

            it('should add the `rs-carousel-vertical` class when vertical', function () {
                expect(root).toHaveClass('rs-carousel-vertical');
            });

            it('should slide the top position when `vertical`', function () {
                var originalPos = getPos(root, 'top');
                root.carousel('next');
                expect(getPos(root, 'top')).not.toEqual(originalPos);
            });

        });

        describe('loop:true', function () {

            it('should loop back to first or last page accordingly', function () {
                root.carousel({
                    loop: true
                });
                expect(getInstance(root).elements.prevAction).toHaveClass('rs-carousel-action-active');
                root.carousel('prev');
                expect(root.carousel('getIndex')).toEqual(1);
            });

        });

        describe('whitespace:false', function () {

            it('should show whitespace on the last page when there aren\'t enough items to fill one page', function () {
                root.carousel({
                    whitespace: true,
                    speed: 0
                });
                root.carousel('next');
                expect(getPos(root)).toEqual(-500);
            });

            it('should set the pages array without taking into account visible items', function () {
                var pages;
                root.carousel({
                    whitespace: true,
                    itemsPerTransition: 2
                });
                pages = root.carousel('getPages');
                // epected: [jQuery(li, li), jQuery(li, li), jQuery(li, li), jQuery(li, li), jQuery(li)]
                expect(pages.length).toEqual(5);
                expect(pages[0].length).toEqual(2);
                expect(pages[4].length).toEqual(1);
            });

        });

        describe('pagination:false', function () {

            it('should prevent the pagination from being inserted into the DOM', function () {
                root.carousel({
                    pagination: false
                });
                expect(root.find('.rs-carousel-pagination')).not.toExist();
            });

        });

        describe('nextPrevActions:false', function () {

            it('should prevent the next and previous actions from being inserted into the DOM', function () {
                root.carousel({
                    nextPrevActions: false
                });
                expect(root.find('.rs-carousel-action')).not.toExist();
            });

        });

        describe('speed:10', function () {

            it('should call into jQuery animate with the correct speed arg', function () {
                var spy;
                root.carousel({
                    speed: 10
                });
                spy = spyOn($.fn, 'animate');
                root.carousel('next');
                expect(spy.mostRecentCall.args[1]).toEqual(10);
            });

        });

        describe('easing:linear', function () {

            it('should call into jQuery animate with the correct easing arg', function () {
                var spy;
                root.carousel({
                    easing: 'linear'
                });
                spy = spyOn($.fn, 'animate');
                root.carousel('next');
                expect(spy.mostRecentCall.args[2]).toEqual('linear');
            });

        });


        // only run test if browser supports csstransforms3d
        if (Modernizr && Modernizr.csstransforms3d) {

            describe('translate3d:true', function () {

                it('should set the CSS `transform` property with translate3d instead of the CSS `left` property', function () {
                    var runner,
                        transformVal;
                    root.carousel({
                        translate3d: true
                    });
                    runner = getInstance(root).elements.runner[0];
                    transformVal = runner.style.WebkitTransform || runner.style.OTransform || runner.style.MozTransform || runner.style.msTransform;
                    expect(transformVal).toContain('translate3d');
                    expect(runner).not.toHaveCss({
                        left: 0
                    });
                });

            });

        }

    });

});