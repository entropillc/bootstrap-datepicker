'use strict';

var DatePicker = function(element) {
  var self = this;
  var $window = $(window['addEventListener'] ? window : document.body);
  var $element = this.$element = $(element).children('input:first-child');
  var element = this.element = $element.get(0);
  var $labelElement = this.$labelElement = $element.siblings('label.add-on');
  var labelElement = this.labelElement = $labelElement.get(0);
  var $calendarElement = this.$calendarElement = $labelElement.children('div.calendar');
  var calendarElement = this.calendarElement = $calendarElement.get(0);
  var value = this.value = this.stringToDate($element.val()) || new Date();
  var format = $element.data('format');
  var year = value.getFullYear();
  var month = value.getMonth();
  var isDraggingYear = false;
  var isDraggingMonth = false;
  var startDragYear = null;
  var startDragMonth = null;
  var startDragX = -1;
  var startDragY = -1;
  
  this.setMonth(year, month);
  
  $element.bind('keydown keyup keypress', function(evt) {
    return false;
  });
  
  $calendarElement.bind("webkitTransitionEnd transitionend oTransitionEnd transitionEnd", function(evt) {
    if (!$element.is(':focus')) return;
    
    var value = self.value = self.stringToDate($element.val());
    
    if (!value) return;
    
    var year = value.getFullYear();
    var month = value.getMonth();

    self.setMonth(year, month);
  });
  
  $labelElement.bind('mousedown', function(evt) {
    if ($element.is(':focus')) {
      $element.blur();
    } else {
      $element.focus();
    }
    
    return false;
  });
  
  $calendarElement.delegate('td', 'mousedown', function(evt) {
    var $this = $(this);
    
    value = self.value = new Date($this.data('year'), $this.data('month'), $this.data('date'));
    
    $calendarElement.find('td.selected').removeClass('selected');
    $this.addClass('selected');
    
    var year = value.getFullYear() + '';
    var month = value.getMonth() + 1 + '';
    var date = value.getDate() + '';
    var dateString = new String(format);
    
    dateString = dateString
      .replace('yyyy', year)
      .replace('yy', year.substring(2))
      .replace('mm', month < 10 ? '0' + month : month)
      .replace('m', month)
      .replace('dd', date < 10 ? '0' + date : date)
      .replace('d', date);
    
    $element.val(dateString);
    
    setTimeout(function() {
      $element.blur();
    }, 200);
    
    return false;
  });
  
  $calendarElement.delegate('th', 'mousedown', function(evt) {
    var $this = $(this);
    var buttonValue = $this.data('value');
    
    if (!buttonValue) return;
    
    var year = self.year;
    var month = self.month;
    
    if (buttonValue === 'year') {
      isDraggingYear = true;
    } else if (buttonValue === 'month') {
      isDraggingMonth = true;
    }
    
    if (isDraggingYear || isDraggingMonth) {
      startDragYear = year;
      startDragMonth = month;
      startDragX = evt.pageX;
      startDragY = evt.pageY;
    }
    
    else {
      month += parseInt(buttonValue, 10);
      
      if (month < 0) {
        month = 11;
        year--;
      } else if (month > 11) {
        month = 0;
        year++;
      }
      
      self.setMonth(year, month);
    }
    
    return false;
  });
  
  $window.bind('mousemove', function(evt) {
    if (!isDraggingYear && !isDraggingMonth) return;
    
    var mouseX = evt.pageX;
    var mouseY = evt.pageY;
    var deltaX = mouseX - startDragX;
    var deltaY = mouseY - startDragY;
    var year = startDragYear;
    var month = startDragMonth;
    
    if (isDraggingYear) {
      year += Math.floor((deltaX + deltaY) / 16);
    } else {
      month += Math.floor((deltaX + deltaY) / 16);
      year += Math.floor(month / 12);
      month = month % 12;
      month += (month < 0) ? 12 : 0;
    }
    
    self.setMonth(year, month);
  });
  
  $window.bind('mouseup', function(evt) {
    if (!isDraggingYear && !isDraggingMonth) return;
    
    isDraggingYear = isDraggingMonth = false;
    startDragYear = startDragMonth = null;
    startDragX = startDragY = -1;
  });
  
  $element.data('datepicker', this);
};

DatePicker.prototype = {
  element: null,
  $element: null,
  labelElement: null,
  $labelElement: null,
  calendarElement: null,
  $calendarElement: null,
  value: null,
  format: 'yyyy-mm-dd',
  year: 0,
  month: 0,
  getDaysInMonth: function(year, month) {
    return 32 - new Date(year, month, 32).getDate();
  },
  getMonthNameByIndex: function(month) {
    switch (month) {
      case 0:
        return 'January';
      case 1:
        return 'February';
      case 2:
        return 'March';
      case 3:
        return 'April';
      case 4:
        return 'May';
      case 5:
        return 'June';
      case 6:
        return 'July';
      case 7:
        return 'August';
      case 8:
        return 'September';
      case 9:
        return 'October';
      case 10:
        return 'November';
      case 11:
        return 'December';
    }
  },
  setMonth: function(year, month) {
    var firstDateOfMonth = new Date(year, month, 1);
    var firstDayOfWeek = firstDateOfMonth.getDay();
    var daysInMonth = this.getDaysInMonth(year, month);
    
    var todaysFullDate = new Date();
    var todaysYear = todaysFullDate.getFullYear();
    var todaysMonth = todaysFullDate.getMonth();
    var todaysDate = todaysFullDate.getDate();
    
    var selectedFullDate = this.value;
    var selectedYear = selectedFullDate.getFullYear();
    var selectedMonth = selectedFullDate.getMonth();
    var selectedDate = selectedFullDate.getDate();
    
    var date = 0;
    
    var thead = '<thead>' +
      '<tr>' +
        '<th data-value="-1">&lt;</th>' +
        '<th data-value="month" colspan="3" style="border-right: none;">' + this.getMonthNameByIndex(month) + '</th>' +
        '<th data-value="year" colspan="2">' + year + '</th>' +
        '<th data-value="1">&gt;</th>' +
      '</tr>' +
      '<tr>' +
        '<th>S</th><th>M</th><th>T</th><th>W</th><th>H</th><th>F</th><th>S</th>' +
      '</tr>' +
    '</thead>';
    
    var tbody = '<tbody>';
    
    for (var week = 0; week < 6; week++) {
      tbody += '<tr>';
      
      for (var day = 0; day < 7; day++) {
        if (date > 0 || day === firstDayOfWeek) {
          date++;
          
          if (date <= daysInMonth) {
            tbody += '<td class="';
            
            if (todaysYear === year && todaysMonth === month && todaysDate === date) {
              tbody += 'today ';
            }
            
            if (selectedYear === year && selectedMonth === month && selectedDate === date) {
              tbody += 'selected ';
            }
            
            tbody += '" data-year="' + year + '" data-month="' + month + '" data-date="' + date + '">' + date + '</td>';
          } else {
            tbody += '<td>&nbsp;</td>';
          }
        } else {
          tbody += '<td>&nbsp;</td>';
        }
      }
      
      tbody += '</tr>';
    }
    
    tbody += '</tbody>';
    
    this.$calendarElement.html('<table>' + thead + tbody + '</table>');
    this.year = year;
    this.month = month;
  },
  dateToString: function(value) {
    var year = value.getFullYear(); year = '' + year;
    var month = value.getMonth() + 1; month = ((month < 10) ? '0' : '') + month;
    var date = value.getDate(); date = ((date < 10) ? '0' : '') + date;
    return year + '-' + month + '-' + date;
  },
  stringToDate: function(value) {
    var dateParts = value.split('-'); if (dateParts.length !== 3) return null;
    var year = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[1], 10) - 1;
    var date = parseInt(dateParts[2], 10);
    return new Date(year, month, date);
  },
};

$(function() {
  
  var $datepickers = $('.datepicker');
  $datepickers.each(function(index, element) { new DatePicker(element); });
  
});
