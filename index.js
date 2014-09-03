;
(function () {

  /**
   * The Censoring object constructor.
   *
   * @constructor
   */
  function Censoring() {

    /**
     * The string to replaces found matches with. Defaults to ***
     *
     * @type {String}
     */
    this.replacementString = '***';

    /**
     * The color used for highlighting
     *
     * @type {string}
     */
    this.highlightColor = 'F2B8B8';

    /**
     * Holds the currently matched text.
     *
     * @type {{replace: string, hasMatches: boolean}}
     */
    this.currentMatch = {
      replace   : '',
      hasMatches: false
    };

    /**
     * The available patterns. These are as follows:
     *  [name]              [description]
     *  - long_number       ; Matches long, consecutive numbers
     *  - phone_number      ; Matches phone numbers.
     *  - email_address     ; Matches email addresses in many formats.
     *  - url               ; Matches URL patterns/
     *  - words             ; Finds words, even when in disguise.
     *
     * @type {{long_number: {pattern: RegExp, enabled: boolean}, phone_number: {pattern: RegExp, enabled: boolean}, email_address: {pattern: RegExp, enabled: boolean}, url: {pattern: RegExp, enabled: boolean}, words: {enabled: boolean, pattern: Array}}}
     */
    this.patterns = {
      long_number  : {
        pattern: /\d{8,}/,
        enabled: false
      },
      phone_number : {
        pattern: /([+-]?[\d]{1,}[\d\s-]+|\([\d]+\))[-\d.\s]{8,}/gi,
        enabled: false
      },
      email_address: {
        pattern: /[\w._%+-]+(@|\[at\]|\(at\))[\w.-]+(\.|\[dot\]|\(dot\)|\(punt\)|\[punt\])[a-zA-Z]{2,4}/gi,
        enabled: false
      },
      url          : {
        pattern: /((https?:\/{1,2})?([-\w]\.{0,1}){2,}(\.|\[dot\]|\(dot\)|\(punt\)|\[punt\])([a-zA-Z]{2}\.[a-zA-Z]{2,3}|[a-zA-Z]{2,4}).*?(?=$|[^\w\/-]))/gi,
        enabled: false
      },
      words        : {
        pattern: [],
        enabled: false
      }
    };

    /**
     * A mapping that maps regular characters to 1337 characters.
     *
     * @type {{o: string, g: string, b: Array, t: string, s: string, a: string, e: string, z: string, i: string, l: string}}
     */
    this.map1337 = {
      o: '0',
      g: '9',
      b: ['8', '6'],
      t: '7',
      s: '5',
      a: '4',
      e: '3',
      z: '2',
      i: '1',
      l: '1'
    };
  }

  Censoring.prototype = {

    /**
     * Set the color of the highlighted occurrences in HEX.
     *
     * @param {string} color
     */
    setHighlightColor: function (color) {
      this.highlightColor = color.replace(/^#/, '');
    },

    /**
     * Is the given object a array.
     * @param {Array} subject
     * @return {Boolean}
     */
    isArray: function (subject) {
      return subject instanceof Array;
    },

    /**
     * Add a pattern to the list of filters. This will allow you to enable / disable them.
     *
     * @param {string}                              name
     * @param {{pattern: RegExp, enabled: boolean}} pattern
     */
    addFilter: function (name, pattern) {
      this.patterns[name] = pattern;
    },

    /**
     * Enable a filter by name.
     *
     * @param   {String}    filter
     * @returns {Censoring}
     */
    enableFilter: function (filter) {
      if (typeof this.patterns[filter] === 'undefined') {
        throw 'Invalid filter supplied.';
      }

      this.patterns[filter].enabled = true;

      return this;
    },

    /**
     * Enable multiple filters at once.
     *
     * @param   {Array}     filters
     * @returns {Censoring}
     * @see     Censoring.enableFilter
     */
    enableFilters: function (filters) {
      if (!this.isArray(filters)) {
        throw 'Invalid filters type supplied. Expected Array.';
      }

      for (var i = 0; i < filters.length; i++) {
        this.enableFilter(filters[i]);
      }

      return this;
    },

    /**
     * Disable a filter by name.
     *
     * @param   {String}    filter
     * @returns {Censoring}
     */
    disableFilter: function (filter) {
      if (typeof this.patterns[filter] === 'undefined') {
        throw 'Invalid filter supplied.';
      }

      this.patterns[filter].enabled = false;

      return this;
    },

    /**
     * Add multiple filterWords.
     *
     * @param   {[]}        words
     * @returns {Censoring}
     */
    addFilterWords: function (words) {
      if (!words instanceof Array) {
        throw 'Invalid type supplied for addFilterWords. Expected array.';
      }

      for (var i = 0; i < words.length; i++) {
        this.addFilterWord(words[i]);
      }

      return this;
    },

    /**
     * Add a word to filter out.
     *
     * @param   {String}    word
     * @returns {Censoring}
     */
    addFilterWord: function (word) {
      var pattern = '',
          any = '[^a-z0-9]?',
          last = false,
          character;

      for (var i = 0; i < word.length; i++) {
        last = i === (word.length - 1);
        character = word.charAt(i);

        if (typeof this.map1337[character] === 'undefined') {
          pattern += (character + (!last ? any : ''));

          continue;
        }

        if (typeof this.map1337[character] === 'string') {
          pattern += ('((' + character + '|' + this.map1337[character] + ')' + (!last ? any : '') + ')');

          continue;
        }

        pattern += '((' + character;

        for (var m = 0; m < this.map1337[character].length; m++) {
          pattern += '|' + this.map1337[character][m];
        }

        pattern += ')' + (!last ? any : '') + ')';
      }

      this.patterns.words.pattern.push(new RegExp(pattern, 'ig'));

      return this;
    },

    /**
     * Set the string to replace matches in the filterString() method.
     *
     * @param   {String}    str
     * @returns {Censoring}
     */
    setReplacementString: function (str) {
      if (typeof str !== 'string') {
        throw 'Invalid replacementString type supplied. Expected string.';
      }

      this.replacementString = str;

      return this;
    },

    /**
     * @returns {String}
     */
    getReplacementString: function () {
      return this.replacementString;
    },

    /**
     * Returns if text matched.
     *
     * @returns {Boolean}
     */
    test: function () {
      return this.currentMatch.hasMatches;
    },

    /**
     * Prepare some text to be matched against.
     *
     * @param   {String}    str
     * @param   {Boolean}   highlight
     * @returns {Censoring}
     */
    prepare: function (str, highlight) {
      this.currentMatch.replace = this.filterString(str, highlight);
      this.currentMatch.hasMatches = str !== this.currentMatch.replace;

      return this;
    },

    /**
     * Get the filtered text.
     *
     * @returns {Censoring}
     */
    replace: function () {
      return this.currentMatch.replace;
    },

    /**
     * Filter the string.
     *
     * @param   {String}    str
     * @param   {Boolean}   highlight
     * @returns {String}}
     */
    filterString: function (str, highlight) {
      highlight = highlight || false;

      var highlightColor = this.highlightColor;

      var replace = function (str, pattern) {
        if (!highlight) {
          return str.replace(pattern, this.replacementString);
        }

        return str.replace(pattern, function (match) {
          return '<span style="background: #' + highlightColor + ';">' + match + '</span>';
        });
      }.bind(this);

      if (typeof str !== 'string') {
        throw 'Invalid "str" type supplied in filterString. Expected string.';
      }

      for (var p in this.patterns) {
        if (!this.patterns[p].enabled) {
          continue;
        }

        if (this.patterns[p].pattern instanceof RegExp) {
          str = replace(str, this.patterns[p].pattern);

          continue;
        }

        if (!this.isArray(this.patterns[p].pattern)) {
          throw 'Invalid pattern type supplied. Expected Array.';
        }

        for (var i = 0; i < this.patterns[p].pattern.length; i++) {
          if (!this.patterns[p].pattern[i] instanceof RegExp) {
            throw 'Expected valid RegExp.';
          }

          str = replace(str, this.patterns[p].pattern[i]);
        }
      }

      return str;
    }
  };

  /*
   * Make sure Censoring is loadable through amd.
   */
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return Censoring;
    });

    return;
  }

  if (typeof module === 'object') {
    module.exports = Censoring;

    return;
  }

  /*
   * Make sure Censoring is accessible beyond our scope.
   */
  window.Censoring = Censoring;
})();
