// Generated by CoffeeScript 1.3.3
(function() {

  window.plugins.method = {
    emit: function(div, item) {},
    bind: function(div, item) {
      var annotate, asValue, attach, avg, calculate, candidates, elem, input, output, polynomial, round, sum, _i, _len;
      input = {};
      output = {};
      asValue = function(obj) {
        if (obj == null) {
          return NaN;
        }
        switch (obj.constructor) {
          case Number:
            return obj;
          case String:
            return +obj;
          case Array:
            return asValue(obj[0]);
          case Object:
            return asValue(obj.value);
          case Function:
            return obj();
          default:
            return NaN;
        }
      };
      candidates = $(".item:lt(" + ($('.item').index(div)) + ")");
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        elem = candidates[_i];
        elem = $(elem);
        if (elem.hasClass('radar-source')) {
          _.extend(input, elem.get(0).radarData());
        } else if (elem.hasClass('data')) {
          _.extend(input, elem.data('item').data[0]);
        }
      }
      div.addClass('radar-source');
      div.get(0).radarData = function() {
        return output;
      };
      div.mousemove(function(e) {
        return $(div).triggerHandler('thumb', $(e.target).text());
      });
      attach = function(search) {
        var source, _j, _len1, _ref;
        _ref = wiki.getDataNodes(div);
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          elem = _ref[_j];
          if ((source = $(elem).data('item')).text.indexOf(search) >= 0) {
            return source.data;
          }
        }
        throw new Error("can't find dataset with caption " + search);
      };
      sum = function(v) {
        return _.reduce(v, function(s, n) {
          return s += n;
        }, 0);
      };
      avg = function(v) {
        return sum(v) / v.length;
      };
      polynomial = function(v) {
        if (v > 3838) {
          return 1 - (1.94842569518139e-17 * Math.pow(v, 4) - 8.68253239668536e-13 * Math.pow(v, 3) + 1.34578302132028e-08 * Math.pow(v, 2) - 0.0000791719080691817 * v + 0.904364653010239);
        } else {
          return 1 - (-3.11369360179418e-08 * Math.pow(v, 2) + 0.000316339584740631 * v);
        }
      };
      round = function(n) {
        if (n == null) {
          return '?';
        }
        if (n.toString().match(/\.\d\d\d/)) {
          return n.toFixed(2);
        } else {
          return n;
        }
      };
      annotate = function(text) {
        if (text == null) {
          return '';
        }
        return " <span title=\"" + text + "\">*</span>";
      };
      calculate = function(item) {
        var allocated, dispatch, lines, list, report;
        list = [];
        allocated = 0;
        lines = item.text.split("\n");
        report = [];
        dispatch = function(list, allocated, lines, report, done) {
          var apply, args, change, color, comment, count, hours, hover, line, next_dispatch, previous, result, value, _ref, _ref1;
          color = '#eee';
          value = comment = hover = null;
          hours = '';
          line = lines.shift();
          if (line == null) {
            return done(report);
          }
          next_dispatch = function() {
            var long;
            if ((value != null) && !isNaN(+value)) {
              list.push(+value);
            }
            long = '';
            if (line.length > 40) {
              long = line;
              line = "" + (line.substr(0, 20)) + " ... " + (line.substr(-15));
            }
            report.push("<tr style=\"background:" + color + ";\">\n  <td style=\"width: 20%; text-align: right;\" title=\"" + (hover || '') + "\">\n    <b>" + (round(value)) + "</b>\n  <td title=\"" + long + "\">" + line + (annotate(comment)));
            return dispatch(list, allocated, lines, report, done);
          };
          apply = function(name, list) {
            var row, table;
            color = '#ddd';
            switch (name) {
              case 'SUM':
                return sum(list);
              case 'AVG':
              case 'AVERAGE':
                return avg(list);
              case 'MIN':
              case 'MINIMUM':
                return _.min(list);
              case 'MAX':
              case 'MAXIMUM':
                return _.max(list);
              case 'FIRST':
                return list[0];
              case 'PRODUCT':
                return _.reduce(list, function(p, n) {
                  return p *= n;
                });
              case 'LOOKUP':
                table = attach('Tier3ExposurePercentages');
                row = _.find(table, function(row) {
                  return asValue(row.Exposure) === list[0] && asValue(row.Raw) === list[1];
                });
                if (row == null) {
                  throw new Error("can't find exposure " + list[0] + " and raw " + list[1]);
                }
                return asValue(row.Percentage);
              case 'POLYNOMIAL':
                return polynomial(list[0]);
              default:
                throw new Error("don't know how to " + name);
            }
          };
          try {
            if (args = line.match(/^([0-9.eE-]+) +([\w \/%(){},-]+)$/)) {
              result = hours = +args[1];
              line = args[2];
              output[line] = value = result;
            } else if (args = line.match(/^([A-Z]+) +([\w \/%(){},-]+)$/)) {
              _ref = [apply(args[1], list), [], list.length], value = _ref[0], list = _ref[1], count = _ref[2];
              hover = "" + args[1] + " of " + count + " numbers\n= " + value;
              line = args[2];
              if (((output[line] != null) || (input[line] != null)) && !item.silent) {
                previous = asValue(output[line] || input[line]);
                if (Math.abs(change = value / previous - 1) > 0.0001) {
                  comment = "previously " + previous + "\nΔ " + (round(change * 100)) + "%";
                  wiki.log('method', args[0], value, '!=', previous);
                }
              }
              output[line] = value;
            } else if (args = line.match(/^([A-Z]+)$/)) {
              _ref1 = [apply(args[1], list), [], list.length], value = _ref1[0], list = _ref1[1], count = _ref1[2];
              hover = "" + args[1] + " of " + count + " numbers\n= " + value;
            } else if (line.match(/^[0-9\.eE-]+$/)) {
              value = +line;
              line = '';
            } else if (args = line.match(/^ *([\w \/%(){},-]+)$/)) {
              if (output[args[1]] != null) {
                value = output[args[1]];
              } else if (input[args[1]] != null) {
                value = asValue(input[args[1]]);
              } else {
                color = '#edd';
                comment = "can't find value of '" + line + "'";
              }
            } else {
              color = '#edd';
              comment = "can't parse '" + line + "'";
            }
          } catch (err) {
            color = '#edd';
            value = null;
            comment = err.message;
          }
          return next_dispatch();
        };
        return dispatch(list, allocated, lines, report, function(report) {
          var table, text;
          text = report.join("\n");
          table = $('<table style="width:100%; background:#eee; padding:.8em;"/>').html(text);
          div.append(table);
          return div.dblclick(function() {
            return wiki.textEditor(div, item);
          });
        });
      };
      return calculate(item);
    }
  };

}).call(this);
