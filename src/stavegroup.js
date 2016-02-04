// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
// Spencer Hitchcock <spencerhitch@gmail.com>:
// 

/** @constructor */
Vex.Flow.StaveGroup = (function() {
  function StaveGroup(x, y, width, options) {
    if (arguments.length > 0) this.init(x, y, width, options);
  }

  var THICKNESS = (Vex.Flow.STAVE_LINE_THICKNESS > 1 ?
        Vex.Flow.STAVE_LINE_THICKNESS : 0);
  StaveGroup.prototype = {
    init: function(x, y, width, options) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.context = null;
      this.font = {
        family: "sans-serif",
        size: 8,
        weight: ""
      };
      this.options = {
        num_staves: 1,
        space_above_stavegroup: 4,      // in staff lines
        space_below_stavegroup: 4      // in staff lines
      };
      this.bounds = {x: this.x, y: this.y, w: this.width, h: 0};
    //  Vex.Merge(this.options, options);

      this.resetStaves();
    },

    resetStaves: function() {
      this.options.stave_config = [];
      for (var i = 0; i < this.options.num_staves; i++) {
        this.options.stave_config.push({visible: true});
      }
      this.height = (this.options.num_staves*5 + this.options.space_above_stavegroup) *
         this.options.spacing_between_staves;
      this.options.bottom_text_position = this.options.num_staves + 1;
    },

    setContext: function(context) {
      this.context = context;
      for(var i=0; i<this.staves.length; i++){
            if(typeof(this.staves[i].setContext) === "function"){
          this.staves[i].setContext(context);
            }
      }
      return this;
    },
    getContext: function() { return this.context; },
    getX: function() { return this.x; },
    getNumStaves: function() { return this.options.num_staves; },
    setNumStaves: function(staves) {
      this.options.num_staves = parseInt(staves, 10);
      this.resetStaves();
      return this;
    },
    setY: function(y) { this.y = y; return this; },

    setX: function(x){
      var shift = x - this.x;
      this.x = x;
      for(var i=0; i<this.modifiers.length; i++) {
      	var mod = this.modifiers[i];
        if (mod.x !== undefined) {
          mod.x += shift;
      	}
      }
      return this;
    },

    setWidth: function(width) {
      this.width = width;

      // reset the x position of the end barline (TODO(0xfe): This makes no sense)
      // this.modifiers[1].setX(this.end_x);
      return this;
    },

    getWidth: function() {
      return this.width;
    },

    setMeasure: function(measure) { this.measure = measure; return this; },

    /**
     * Gets the pixels to shift from the beginning of the stave
     * following the modifier at the provided index
     * @param  {Number} index The index from which to determine the shift
     * @return {Number}       The amount of pixels shifted
     */
    getModifierXShift: function(index) {
      if (typeof index === 'undefined') index = this.glyphs.length -1;
      if (typeof index !== 'number') new Vex.RERR("InvalidIndex",
        "Must be of number type");

      var x = this.glyph_start_x;
      var bar_x_shift = 0;

      for (var i = 0; i < index + 1; ++i) {
        var glyph = this.glyphs[i];
        x += glyph.getMetrics().width;
        bar_x_shift += glyph.getMetrics().width;
      }

      // Add padding after clef, time sig, key sig
      if (bar_x_shift > 0) bar_x_shift += this.options.vertical_bar_width + 10;

      return bar_x_shift;
    },

    getHeight: function() {
      return this.height;
    },

    getSpacingBetweenStaves: function() {
      return this.options.spacing_between_staves_px;
    },

    getBottomY: function() {
      var options = this.options;
      var spacing = options.spacing_between_staves_px;
      var score_bottom = this.getYForLine(options.num_staves) +
         (options.space_below_staff_ln * spacing);

      return score_bottom;
    },

    getBottomStaveY: function() {
      return this.getYForStave(this.options.num_staves);
    },

    getYForStave: function(stave) {
      var options = this.options;
      var spacing = options.spacing_between_stave_px;
      var headroom = options.space_above_staff_ln;

      var y = this.y + ((stave * spacing) + (headroom * spacing)) -
        (THICKNESS / 2);

      return y;
    },

    /**
     * All drawing functions below need the context to be set.
     */
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");

      var num_staves = this.options.num_staves;
      var width = this.width;
      var x = this.x;
      var y;

      // Render staves 
      for (var stave_index=0; stave < num_staves; stave_index++) {
        y = this.getYForStave(stave_index);

        this.context.save();
        var stave = new  Vex.Flow.Stave(x,y,width);
        stave.setContext(this.context).draw();
        this.context.restore();
      }

      // Render measure numbers
//      if (this.measure > 0) {
//        this.context.save();
//        this.context.setFont(this.font.family, this.font.size, this.font.weight);
//        var text_width = this.context.measureText("" + this.measure).width;
//        y = this.getYForTopText(0) + 3;
//        this.context.fillText("" + this.measure, this.x - text_width / 2, y);
//        this.context.restore();
//      }

      return this;
    },

    /**
     * Get the current configuration for the Stave.
     * @return {Array} An array of configuration objects.
     */
//    getConfigForLines: function() {
//      return this.options.line_config;
//    },
//
//    /**
//     * Configure properties of the lines in the Stave
//     * @param line_number The index of the line to configure.
//     * @param line_config An configuration object for the specified line.
//     * @throws Vex.RERR "StaveConfigError" When the specified line number is out of
//     *   range of the number of lines specified in the constructor.
//     */
//    setConfigForLine: function(line_number, line_config) {
//      if (line_number >= this.options.num_lines || line_number < 0) {
//        throw new Vex.RERR("StaveConfigError",
//          "The line number must be within the range of the number of lines in the Stave.");
//      }
//      if (!line_config.hasOwnProperty('visible')) {
//        throw new Vex.RERR("StaveConfigError",
//          "The line configuration object is missing the 'visible' property.");
//      }
//      if (typeof(line_config.visible) !== 'boolean') {
//        throw new Vex.RERR("StaveConfigError",
//          "The line configuration objects 'visible' property must be true or false.");
//      }
//
//      this.options.line_config[line_number] = line_config;
//
//      return this;
//    },
//
//    /**
//     * Set the staff line configuration array for all of the lines at once.
//     * @param lines_configuration An array of line configuration objects.  These objects
//     *   are of the same format as the single one passed in to setLineConfiguration().
//     *   The caller can set null for any line config entry if it is desired that the default be used
//     * @throws Vex.RERR "StaveConfigError" When the lines_configuration array does not have
//     *   exactly the same number of elements as the num_lines configuration object set in
//     *   the constructor.
//     */
//    setConfigForLines: function(lines_configuration) {
//      if (lines_configuration.length !== this.options.num_lines) {
//        throw new Vex.RERR("StaveConfigError",
//          "The length of the lines configuration array must match the number of lines in the Stave");
//      }
//
//      // Make sure the defaults are present in case an incomplete set of
//      //  configuration options were supplied.
//      for (var line_config in lines_configuration) {
//        // Allow 'null' to be used if the caller just wants the default for a particular node.
//        if (!lines_configuration[line_config]) {
//          lines_configuration[line_config] = this.options.line_config[line_config];
//        }
//        Vex.Merge(this.options.line_config[line_config], lines_configuration[line_config]);
//      }
//
//      this.options.line_config = lines_configuration;
//
//      return this;
//    }
  };

  return Stave;
}());
