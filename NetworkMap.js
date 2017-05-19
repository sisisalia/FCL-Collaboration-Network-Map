$(document).ready(function() {

  // Running DataRetrieval.php file
  $.get('DataRetrieval.php');

  // Get the width and height of the window
  var width = $(window).width();
  var height = $(window).height();

  // For zooming and translate functions
  var transform = d3.zoomIdentity;

  // Mapping of window height and width with range 0-100
  var xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
  var yScale = d3.scaleLinear().domain([0, 100]).range([0, height]);

  // Dynamically set up the svg's width, height and view box when page is load
  $('#map').attr('width', width);
  $('#map').attr('height', height);
  $('#map').attr('viewBox', '-300 0 ' + xScale(250) + ' ' + yScale(95));

  d3.json('graph.json', function(error, graph) {

      ///////////////
      // Variables //
      ///////////////

      // Collaborators' position radius
      var outerRadius = xScale(50);
      // Projects' position radius
      var innerRadius = xScale(25);
      // Projects' radius
      var projectRadius = xScale(0.5);
      // Used by 'neighbouring' function
      var linkedByIndex = {};
      // Used to name id of the arcs
      var rand = 111110;
      // Stroke-width if the path is highlighted or faded
      var stroke_highlight = 3;
      var stroke_fade = 0.2;
      // Opacity when the nodes is highlighted or faded
      var opacity_highlight = 0.9;
      var opacity_fade = 0.2;

      var collaborator_color = 'reds';
      var collaborator_size = xScale(30);

      var label_size = xScale(1.5);

      var zoom_min = 0.5;
      var zoom_max = 1.5;

      /////////////////////////////
      // Nodes, paths and tooltip //
      /////////////////////////////

      var svg = d3.select('svg'),
          width = +svg.attr('width'),
          height = +svg.attr('height');

      var simulation = d3.forceSimulation().force('link', d3.forceLink().id(function(d) {return d.id;}));

      var path = svg.append('g').attr('class', 'link').selectAll('path').data(graph.links).enter().append('path').attr('stroke-width', stroke_highlight);

      var g = svg.append('g');

      d3.select('body').append("div").attr("class", "tooltip").style("opacity", opacity_highlight);

      $('.tooltip').hide();

      var node = g.selectAll('.node').data((graph.nodes)).enter().append('g').attr('class', 'nodes')
          .attr('fill', function(d) {
              if (d.type == 'Collaborator') {
                  return collaborator_color;
              }
          })
          .attr('opacity', opacity_highlight)
          .attr('id', function(d) {
              var id = d.id;
              var result = id.replace(/ /g, '_');
              var result = result.replace('/', '_');
              return result;
          })
          .on("click", function(d) {
              var id = getId(d);
              // Don't allow clicking on faded node
              if ($(id).attr('opacity') != opacity_highlight) return;
              // Only one tooltip showing at one time
              $('.tooltip').children().remove();
              // Get the available collaborators
              getCollaboratorFiltered();
              // Dimmed all of the nodes
              initialization();
              // Highlight current node
              $(id).attr('opacity', opacity_highlight);
              // Highlight neighbouring node which is active only
              highlightNeighbours(d, 1);
              path.style('stroke-width', function(l) {
                  // Highlight only those path to available nodes
                  var index;
                  index = project_filtered.indexOf(l.target);
                  if (index == -1) return;
                  index = collaborator_filtered.indexOf(l.source);
                  if (index == -1) return;
                  if (d === l.source || d === l.target) {
                      return stroke_highlight;
                  } else {
                      return stroke_fade;
                  }
              });
              $('.tooltip').show();
              if (d.type === 'Project') {
                  $('.tooltip').append(
                      '<button class="glyphicon glyphicon-remove-circle" style="text-align:right;">' + '</button>' +
                      '<div id="project_tag">' +
                      '<table id="project_tag_table1"><col width="10%"><col width="80%"><col width="10%">' +
                      '<tr>' +
                      '<td style="padding-right: 7px">' +
                      '<canvas id="myChart"></canvas>' + '</td>' +
                      '<td>' +
                      '<span id="project_tag_title">' +
                      d.id + '</span>' + '</td></tr>' + '</table><table id="project_tag_table2">' +
                      '<tr>' +
                      '<td class="project_tag_content_title">' +
                      'Start date' +
                      '</td>' +
                      '<td class="project_tag_content_subject">' +
                      d.start_date +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="project_tag_content_title">' +
                      'Duration' +
                      '</td>' +
                      '<td class="project_tag_content_subject">' +
                      d.project_duration +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="project_tag_content_title">' +
                      'FCL project' +
                      '</td>' +
                      '<td class="project_tag_content_subject">' +
                      d.research_groups +
                      '</td>' +
                      '</tr>' +
                      '</table>' + '</div>'
                  );
                  // If offset() function is not available
                  if($(this).offset().left == 0){
                    $('.tooltip').css("right", '9px').css("top", "230px" );
                    $('.glyphicon-remove-circle').addClass('glyphicon-remove-sign');
                    $('.glyphicon-remove-sign').removeClass('glyphicon-remove-circle');
                    $('#project_tag').css('padding-top','20px');
                  }else{
                    $('.tooltip').css("left", $(this).offset().left + d.radius * xScale(0.8) + 'px').css("top", $(this).offset().top + 'px');
                  }
              } else {
                  $('.tooltip').append(
                      '<button class="glyphicon glyphicon-remove-circle" style="text-align:right;">' + '</button>' +
                      '<div id="collaborator_tag">' +
                      '<table id="collaborator_tag_table1"><col width="10%"><col width="80%"><col width="10%">' +
                      '<tr>' +
                      '<td>' +
                      '<svg id="collaborator_logo" height="15px" width="15px">' +
                      '<rect width="12" height="12" fill="' + collaborator_color +'" />' +
                      '</svg>' + '</td>' +
                      '<td>' +
                      '<span id="collaborator_tag_title">' +
                      'ID ' + d.id + '</span>' + '</td></tr>' + '</table><table id="collaborator_tag_table2">' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title">' +
                      'Discipline' +
                      '</td>' +
                      '<td class="project_tag_content_subject">' +
                      d.disciplinary_backgrounds +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title">' +
                      'FCL Project' +
                      '</td>' +
                      '<td class="collaborator_tag_content_subject">' +
                      d.research_group +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title">' +
                      'Location' +
                      '</td>' +
                      '<td class="collaborator_tag_content_subject">' +
                      d.locations +
                      '</td>' +
                      '</tr>' + '</table><table id="collaborator_tag_table3">' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title" style="padding-right: 20px">' +
                      'Start date' +
                      '</td>' +
                      '<td class="collaborator_tag_content_subject">' +
                      d.start_date +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title">' +
                      'Education' +
                      '</td>' +
                      '<td class="collaborator_tag_content_subject">' +
                      d.academic_background +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title">' +
                      'Language' +
                      '</td>' +
                      '<td class="collaborator_tag_content_subject">' +
                      d.mother_tongues +
                      '</td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td class="collaborator_tag_content_title">' +
                      'Gender' +
                      '</td>' +
                      '<td class="collaborator_tag_content_subject">' +
                      d.gender +
                      '</td>' +
                      '</tr>' +
                      '</table>' + '</div>'
                  )
                  // If offset() function is not available
                  if($(this).offset().left == 0){
                    $('.tooltip').css("right", '9px').css("top", "230px" );
                    $('.glyphicon-remove-circle').addClass('glyphicon-remove-sign');
                    $('.glyphicon-remove-sign').removeClass('glyphicon-remove-circle');
                    $('#collaborator_tag').css('padding-top','25px');
                  }else{
                    $('.tooltip').css("left", $(this).offset().left + 20 + 'px').css("top", $(this).offset().top + 'px');
                  }
              }
              // Adding project pie chart into tooltip
              if (d.type == 'Project') {
                  var ctx = $("#myChart");
                  var percent = [];
                  var color = [];
                  for (var i = 0; i < d.pieChart.length; i++) {
                      percent.push(d.pieChart[i].percent);
                      color.push(d.pieChart[i].color);
                  }
                  var data = {
                      datasets: [{
                          data: percent,
                          backgroundColor: color,
                          hoverBackgroundColor: color
                      }]
                  };
                  new Chart(ctx, {
                      type: 'pie',
                      data: data,
                      options: {
                          tooltips: {
                              enabled: false
                          },
                          elements: {
                              arc: {
                                  borderWidth: 0
                              }
                          },
                      },
                  });
                  $('#myChart').width('30');
                  $('#myChart').height('30');
              }
          });

      // Project and collaborator nodes
      node.append('path')
          .attr('d', d3.symbol()
              .size(collaborator_size)
              .type(function(d) {
                  if (d.type == 'Project') {
                      return d3.symbolCircle;
                  } else if (d.type == 'Collaborator') {
                      return d3.symbolSquare;
                  }
              }));

      // Project nodes
      node.each(function(d) {
          if (d.type == 'Project') {
              NodePieBuilder.drawNodePie(d3.select(this), d.pieChart, {
                  showLabelText: false,
                  radius: Math.sqrt(d.radius) * xScale(1.5) + projectRadius,
              });
          }
      });

      simulation.nodes(graph.nodes);

      simulation.force('link').links(graph.links);

      // Drawing of the visualization
      function drawing(choice) {
          var project_length = 0;
          var collaborator_length = 0;
          var choice_type = [];
          var choice_qty = [];
          var choice_qty_temp = [];
          var total_radius = 0;
          var min = 9999;
          var max = 0;

          $('[id^="arc"]').remove();

          for ($i = 0; $i < graph.nodes.length; $i++) {
              if (graph.nodes[$i].type == 'Project') {
                  project_length++;
                  total_radius += graph.nodes[$i].radius;
              } else {
                  var arr = (Array.isArray(graph.nodes[$i][choice]));
                  if (arr == 1) {
                      var length = graph.nodes[$i][choice].length;
                      if (min > length) min = length;
                      if (max < length) max = length;
                  }
                  collaborator_length++;
              }
          }

          for (i = 0; i < graph.nodes.length; i++) {
              if (graph.nodes[i].type == 'Collaborator') {
                  break;
              }
          }

          if (!Array.isArray(graph.nodes[i][choice])) {
              for ($i = 0; $i < graph.nodes.length; $i++) {
                  if (graph.nodes[$i].type == 'Project') {
                      continue;
                  } else {
                      var temp = graph.nodes[$i][choice];
                      if (choice_type.indexOf(temp) == -1) {
                          choice_type.push(temp);
                          choice_qty.push(1);
                          choice_qty_temp.push(1);
                          if ($i != graph.nodes.length - 1) {
                              choice_type.push('');
                              choice_qty.push(-1);
                              choice_qty_temp.push(-1);
                          }
                      } else {
                          var index = choice_type.indexOf(temp);
                          choice_qty[index] += 1;
                          choice_qty_temp[index] += 1;
                      }
                  }
              }
          } else {
              for (j = min; j <= max; j++) {
                  for ($i = 0; $i < graph.nodes.length; $i++) {
                      if (graph.nodes[$i].type == 'Project') {
                          continue;
                      } else {
                          if (graph.nodes[$i][choice].length == j) {
                              var temp = sortArray(graph.nodes[$i][choice]);
                              if (choice_type.indexOf(temp) == -1) {
                                  choice_type.push(temp);
                                  choice_qty.push(1);
                                  choice_qty_temp.push(1);
                                  choice_type.push('');
                                  choice_qty.push(-1);
                                  choice_qty_temp.push(-1);
                              } else {
                                  var index = choice_type.indexOf(temp);
                                  choice_qty[index] += 1;
                                  choice_qty_temp[index] += 1;
                              }
                          }
                      }
                  }
              }
          }

          // Uncomment to show projects' arcs
          // for (var i = 0; i < graph.nodes.length; i++){
          //   if( graph.nodes[i].type == 'Project'){
          //     projectChart(i, graph.nodes[i].radius, total_radius);
          //   }
          // }

          var start_angle = [];
          var end_angle = [];
          var increment = [];

          var outer_angle = 2 * Math.PI / (choice_type.length - 1);

          var angle = 0;

          for (var i = 0; i < choice_type.length; i++) {
              start_angle[i] = angle + 0.01;
              var added = pieChartLabel(choice_type[i], angle, outer_angle, choice_qty[i], i);
              angle = added;
              end_angle[i] = angle - 0.06;
              increment[i] = 0;
          }

          var inner_angle = 2 * Math.PI / (project_length);

          var x_inner = 0;
          var y_inner = 0;

          var angle;

          function translate_outer_x(d) {
              if (d.type == 'Collaborator') {
                  var arr = Array.isArray(d[choice]);
                  if (arr == 1) {
                      var temp = d[choice].toString();
                  } else {
                      var temp = d[choice];
                  }
                  var index = choice_type.indexOf(temp);
              }
              if (choice_qty[index] == 1) {
                  angle = (start_angle[index] + end_angle[index]) / 2;
              } else if (choice_qty[index] == choice_qty_temp[index]) {
                  angle = start_angle[index];
                  choice_qty_temp[index]--;
              } else {
                  increment[index] += (end_angle[index] - start_angle[index]) / (choice_qty[index] - 1);
                  angle = start_angle[index] + increment[index];
              }
              d.x = Math.cos(-Math.PI / 2 + angle) * outerRadius + xScale(100);
              return Math.cos(-Math.PI / 2 + angle) * outerRadius;
          }

          function translate_outer_y(d) {
              if (d.type == 'Collaborator') {
                  var arr = Array.isArray(d[choice]);
                  if (arr == 1) {
                      var temp = d[choice].toString();
                  } else {
                      var temp = d[choice];
                  }
                  var index = choice_type.indexOf(temp);
              }
              d.y = Math.sin(-Math.PI / 2 + angle) * outerRadius + yScale(60);
              return Math.sin(-Math.PI / 2 + angle) * outerRadius;
          }

          var project_start_angle = 0;
          var project_end_angle = -0.09;
          var project_angle = 0;

          function translate_inner_x(d) {
              // x_inner += inner_angle;
              project_increment = (d.radius / total_radius) * 2 * Math.PI;
              project_end_angle += project_increment;
              project_angle = (project_end_angle + project_start_angle) / 2;
              d.x = Math.cos(-Math.PI / 2 + project_angle) * innerRadius + xScale(100);
              return Math.cos(-Math.PI / 2 + project_angle) * innerRadius;
          }

          function translate_inner_y(d) {
              // y_inner += inner_angle;
              d.y = Math.sin(-Math.PI / 2 + project_angle) * innerRadius + yScale(60);
              project_increment = (d.radius / total_radius) * 2 * Math.PI;
              project_start_angle += project_increment;
              return Math.sin(-Math.PI / 2 + project_angle) * innerRadius;
          }

          node.attr("transform", function(d) {
              if (d.type == 'Project') {
                  return "translate(" + translate_inner_x(d) + "," + translate_inner_y(d) + ")";
              }
              if (d.type == 'Collaborator') {
                  return "translate(" + translate_outer_x(d) + "," + translate_outer_y(d) + ")";
              }
          });

          node.transition().duration(1).attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
          });

          path.transition().duration(1).attr("d", function(d) {
              var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy);
              return "M" +
                  d.source.x + "," +
                  d.source.y + "A" +
                  dr + "," + dr + " 0 0,1 " +
                  d.target.x + "," +
                  d.target.y;
              // var dx = d.target.x - d.source.x,
              //   dy = d.target.y - d.source.y,
              //   dr = Math.sqrt(dx * dx + dy * dy);
              //   //bezier curve
              //   var source_NE;
              //   var source_NW;
              //   var source_SW;
              //   var source_SE;
              //   var target_NE;
              //   var target_NW;
              //   var target_SW;
              //   var target_SE;
              //   var vertical = width;
              //   var horizontal = height;
              //   if(d.source.x > vertical){
              //     if(d.source.y > horizontal){
              //       source_SE = 1;
              //     }else{
              //       source_NE = 1;
              //     }
              //   }else{
              //     if(d.source.y > horizontal){
              //       source_SW = 1;
              //     }else{
              //       source_NW = 1;
              //     }
              //   }
              //   if(d.target.x > vertical){
              //     if(d.target.y > horizontal){
              //       target_SE = 1;
              //     }else{
              //       target_NE = 1;
              //     }
              //   }else{
              //     if(d.target.y > horizontal){
              //       target_SW = 1;
              //     }else{
              //       target_NW = 1;
              //     }
              //   }
              //   if((source_NW == 1 && target_SW == 1)){
              //     var point1_x = vertical;
              //     var point1_y = horizontal;
              //     var point2_x = d.target.x ;
              //     var point2_y = d.target.y;
              //       return "M" +
              //       d.source.x + " " +
              //       d.source.y + " C " +
              //       point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //       d.target.x+ " " +
              //       d.target.y;
              //   }
              //   else if((source_NE == 1 && target_SE == 1)){
              //     var point1_x = vertical;
              //     var point1_y = horizontal;
              //     var point2_x = d.target.x ;
              //     var point2_y = d.target.y;
              //       return "M" +
              //       d.source.x + " " +
              //       d.source.y + " C " +
              //       point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //       d.target.x+ " " +
              //       d.target.y;
              //   }
              //   else if((source_SE == 1 && target_NE == 1) ){
              //     var point1_x = vertical;
              //     var point1_y = horizontal;
              //     var point2_x = d.target.x;
              //     var point2_y = d.target.y;
              //       return "M" +
              //       d.source.x + " " +
              //       d.source.y + " C " +
              //       point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //       d.target.x+ " " +
              //       d.target.y;
              //   }
              //   else if((source_SW == 1 && target_NW == 1) ){
              //     var point1_x = vertical;
              //     var point1_y = horizontal;
              //     var point2_x = d.target.x;
              //     var point2_y = d.target.y;
              //       return "M" +
              //       d.source.x + " " +
              //       d.source.y + " C " +
              //       point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //       d.target.x+ " " +
              //       d.target.y;
              //   }
              //
              //   else if(source_NE == 1 && target_SW == 1){
              //     if(d.source.x > vertical){
              //       var point1_x = vertical ;
              //       var point1_y = horizontal;
              //       var point2_x = vertical ;
              //       var point2_y = horizontal;
              //     }else{
              //       var point1_x = vertical ;
              //       var point1_y = horizontal  ;
              //       var point2_x = vertical ;
              //       var point2_y = horizontal;
              //     }
              //     return "M" +
              //     d.source.x + " " +
              //     d.source.y + " C " +
              //     point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //     d.target.x+ " " +
              //     d.target.y;
              //   }
              //
              //   else if(source_SW == 1 && target_NE == 1){
              //     if(d.source.x > vertical ){
              //       var point1_x = vertical ;
              //       var point1_y = horizontal ;
              //       var point2_x = vertical ;
              //       var point2_y = horizontal ;
              //     }else{
              //       var point1_x = vertical;
              //       var point1_y = horizontal  ;
              //       var point2_x = vertical ;
              //       var point2_y = horizontal;
              //     }
              //     return "M" +
              //     d.source.x + " " +
              //     d.source.y + " C " +
              //     point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //     d.target.x+ " " +
              //     d.target.y;
              //   }
              //
              //   else if(source_SE == 1 && target_NW == 1){
              //       if(d.source.x > vertical ){
              //         var point1_x = vertical;
              //         var point1_y = horizontal ;
              //         var point2_x = vertical  ;
              //         var point2_y = horizontal;
              //       }else{
              //         var point1_x = vertical;
              //         var point1_y = horizontal ;
              //         var point2_x = vertical ;
              //         var point2_y = horizontal;
              //       }
              //       return "M" +
              //       d.source.x + " " +
              //       d.source.y + " C " +
              //       point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //       d.target.x+ " " +
              //       d.target.y;
              //   }
              //
              //   //not really tested yet
              //   else if(source_NW == 1 && target_SE == 1){
              //       if(d.source.x < vertical){
              //         var point1_x = vertical ;
              //         var point1_y = horizontal ;
              //         var point2_x = vertical  ;
              //         var point2_y = horizontal;
              //       }else{
              //         var point1_x = vertical  ;
              //         var point1_y = horizontal ;
              //         var point2_x = vertical  ;
              //         var point2_y = horizontal;
              //       }
              //       return "M" +
              //       d.source.x + " " +
              //       d.source.y + " C " +
              //       point1_x + " " + point1_y + " , " + point2_x + " " + point2_y + ","  +
              //       d.target.x+ " " +
              //       d.target.y;
              //   }
              //
              //   else if(dr < xScale(25)){
              //       return "M" +
              //       d.source.x + "," +
              //       d.source.y + "A" +
              //       dr + "," + dr + " 0 0,1 " +
              //       d.target.x+ "," +
              //       d.target.y;
              //   }else{
              //     return "M" +
              //     d.source.x + "," +
              //     d.source.y + "A" +
              //     dr + "," + dr + " 0 0,1 " +
              //     d.target.x+ "," +
              //     d.target.y;
              //   }
          });

          graph.links.forEach(function(d) {
              linkedByIndex[d.source.index + "," + d.target.index] = 1;
              linkedByIndex[d.target.index + "," + d.source.index] = 1;
          });
          simulation.alpha(1.0);
      };

      ///////////////
      // Labelling //
      ///////////////

      // Translation for the label
      var temp_x = width / 2 + xScale(50);
      var temp_y = height / 2 + yScale(10);

      var group = svg.append('g');

      // Create arcs
      function pieChartLabel(label, angle, plus, qty, number) {
          pi = Math.PI;
          if (label == '') {
              var added = (angle + plus);
              var arc = d3.arc()
                  .innerRadius(outerRadius + xScale(2))
                  .outerRadius(outerRadius + xScale(2.3))
                  .startAngle((angle))
                  .endAngle((angle + plus) - 0.05);
          } else {
              var added = (angle + qty * 0.143);
              var arc = d3.arc()
                  .innerRadius(outerRadius + xScale(2))
                  .outerRadius(outerRadius + xScale(2.3))
                  .startAngle((angle))
                  .endAngle((angle + qty * 0.143) - 0.05);
          }

          var textPath = group.append("path")
              .attr("d", arc)
              .attr("id", "arc" + number)
              .attr("transform", "translate(" + temp_x + "," + temp_y + ")");

          if (label == '') {
              textPath.attr('fill', 'transparent');
          } else {
              textPath.attr('fill', 'gray');
          }

          // If it is an array,stack the labels vertically
          var is_array = label.indexOf(',');
          if (is_array != -1) {
              var arr = [];
              while (is_array != -1) {
                  arr.push(label.substring(0, is_array));
                  label = label.substring(is_array + 1, label.length);
                  is_array = label.indexOf(',');
              }
              arr.push(label);
              for (var i = 0; i < arr.length; i++) {
                  textLabel(arr[i], angle, plus, qty, number + 100 + rand, i + 1);
                  rand++;
              }
          } else {
              textLabel(label, angle, plus, qty, number + 100);
          }

          return added;
      }

      // Put the labels above the arcs
      function textLabel(label, angle, plus, qty, number, add) {
          pi = Math.PI;
          var added = (angle + qty * 0.143);
          if (add != null) {
              var arc = d3.arc()
                  .innerRadius(outerRadius + xScale(2))
                  .outerRadius(outerRadius + xScale(2.3 * add))
                  .startAngle((angle) - 1.05)
                  .endAngle((angle + qty * 0.143) + 1);
          } else {
              var arc = d3.arc()
                  .innerRadius(outerRadius + xScale(2))
                  .outerRadius(outerRadius + xScale(2.3))
                  .startAngle((angle) - 1.05)
                  .endAngle((angle + qty * 0.143) + 1);
          }

          var textPath = svg.append("path")
              .attr("d", arc)
              .attr("id", "path" + number)
              .attr("transform", "translate(" + temp_x + "," + temp_y + ")")
              .attr('fill', 'transparent');

          // Add a text label.
          var text = group.append("text")
              .attr("dy", -40)
              .attr('font-size', label_size + 'px');

          text.append("textPath")
              .data(graph.nodes)
              .attr("startOffset", "25%")
              .attr('x', 10)
              .style("text-anchor", "middle")
              .attr("xlink:href", "#path" + number)
              .text(label);
      }

      var project_increment = 0;

      // Extra function to draw the arcs on the project circle
      function projectChart(number, radius, total_radius) {
          pi = Math.PI;

          var angle = project_increment + radius / total_radius * 2 * pi;

          var arc = d3.arc()
              .innerRadius(innerRadius)
              .outerRadius(innerRadius + 4)
              .startAngle(project_increment)
              .endAngle(angle - 0.1);

          project_increment = angle;

          var temp_x = width / 2 + xScale(60);
          var temp_y = height / 2 + yScale(15);

          var textPath = svg.append("path")
              .attr("d", arc)
              .attr("id", "path" + number)
              .attr("transform", "translate(" + temp_x + "," + temp_y + ")");

          textPath.attr('fill', 'red');
      }

      ////////////////////////
      // Zoom and tranlsate //
      ////////////////////////

      var a = 0;

      zoom = d3.zoom()
          .scaleExtent([zoom_min, zoom_max])
          .on("zoom", zoomed);

      svg.call(zoom);

      // Zoom and translate
      function zoomed() {
          if(a == 1){
            scale = null;
          }
          var original = d3.event.transform.toString();
          var i = original.indexOf(')');
          var scale = original.substring(i + 8, original.length - 2);
          if(scale){
            if (scale == 0) {
                scale = zoom_min;
            }
            if (scale == 1) {
                scale = zoom_max;
            }
          }
          if(!scale){
            scale = 1;
          }
          $('#legend-circle-1').attr('cx', (Math.sqrt(6) * xScale(0.6) + projectRadius) * scale);
          $('#legend-circle-2').attr('cx', (Math.sqrt(6) * xScale(0.6) + projectRadius) * scale);
          $('#legend-circle-3').attr('cx', (Math.sqrt(6) * xScale(0.6) + projectRadius) * scale);

          $('#legend-svg-1').attr('width', (Math.sqrt(6) * xScale(0.6) + projectRadius) * scale);
          $('#legend-svg-2').attr('width', (Math.sqrt(6) * xScale(0.6) + projectRadius) * scale);
          $('#legend-svg-3').attr('width', (Math.sqrt(6) * xScale(0.6) + projectRadius) * scale);

          $('#legend-svg-1').attr('height', ((Math.sqrt(2) * xScale(0.3) + projectRadius) * 2) * scale);
          $('#legend-circle-1').attr('cy', (Math.sqrt(2) * xScale(0.3) + projectRadius) * scale);
          $('#legend-circle-1').attr('r', (Math.sqrt(2) * xScale(0.3) + projectRadius) * scale);

          $('#legend-svg-2').attr('height', ((Math.sqrt(4) * xScale(0.4) + projectRadius) * 2) * scale);
          $('#legend-circle-2').attr('cy', (Math.sqrt(4) * xScale(0.4) + projectRadius) * scale);
          $('#legend-circle-2').attr('r', (Math.sqrt(4) * xScale(0.4) + projectRadius) * scale);

          $('#legend-svg-3').attr('height', ((Math.sqrt(6) * xScale(0.5) + projectRadius) * 2) * scale);
          $('#legend-circle-3').attr('cy', (Math.sqrt(6) * xScale(0.5) + projectRadius) * scale);
          $('#legend-circle-3').attr('r', (Math.sqrt(6) * xScale(0.5) + projectRadius) * scale);

          g.attr("transform", d3.event.transform);
          path.attr('transform', d3.event.transform);
          group.attr('transform', d3.event.transform);
      }

      /////////////
      // Sorting //
      /////////////

      // First sorting when the page is loaded
      $('.sorting').each(function(d){
        if($(this).is(':checked')){
          var id = $(this).attr('id');
          drawing(id);
        }
      })

      $('.sorting').on('click', function() {
          mousedown($(this).attr('id'));
      })

      function mousedown(choice) {
          $('text').remove();
          $('[id^=path]').remove();
          drawing(choice);
          simulation.restart();
          simulation.alpha(1.0);
      }

      ////////////////////////
      // Filtering function //
      ////////////////////////

      // Keeping all the project nodes highlighted
      var project_filtered = [];
      // Keeping all the collaborator nodes connected to project nodes which have already filtered
      var collaborator_filtered = [];
      // Keeping all the collabortor nodes from collaborator_filtered plus filtering by collaborator characteristics
      var collaborator_alive = [];
      var options = {
          'project_outcome': 'project_outcome',
          'disciplines': 'disciplinary_backgrounds',
          'fcl_project': 'research_group',
          'location': 'locations',
          'language': 'mother_tongues',
      }

      // Inserting nodes which are highlighted
      for (var i = 0; i < graph.nodes.length; i++) {
          if (graph.nodes[i].type == 'Project') {
              project_filtered.push(graph.nodes[i]);
          } else {
              collaborator_filtered.push(graph.nodes[i]);
          }
      }
      collaborator_alive = collaborator_filtered;

      // Activate when year slider is changed
      $("#start_project").bind('contentchanged', function() {
          project_filtered = projectFilter($(this).text());
      });

      // Activate when project outcomes' checkbox checked or unchecked
      $('.project_outcome').on('click', function() {
          project_filtered = projectFilter($(this).text());
      })

      // Activate when explore the collaborators changed
      $('[class$=-choices]').on('click', function() {
          collaboratorsFilter(project_filtered, collaborator_filtered, $(this).attr('class'), $(this).text());
      })

      function collaboratorsFilter(project_filtered, collaborator_filtered, class_name, click) {
          // Get all options available
          // In order to be able to determine which collaborators' characteristics it is from
          var original = getAllChoices('.' + class_name);
          var click = click.toLowerCase();
          var index = class_name.indexOf('-');
          var choice = class_name.substring(0, index);
          // Get div where result of the user input is inserted or removed
          var inputID = '#' + choice + '-result';
          var inputs = [];
          // Get existing inputs
          $(inputID).children().each(function() {
              inputs.push($(this).text().toLowerCase());
          })
          // If the checkbox selected not inside the existing one and it is inside the original
          // else if the checkbox exist in existing, remove, if not inside original, index = -1;
          if (inputs.indexOf(click) == -1 && original.indexOf(click) != -1) {
              inputs.push(click);
          } else {
              index = inputs.indexOf(click);
              inputs.splice(index, 1);
          }
          // Filter the collaborators if inputs is not 0;
          // if input is 0, highlight all the previous nodes
          if (inputs.length != 0) {
              collaborator_alive = collaboratorFilteringFunction(collaborator_filtered, choice, original, inputs);
          } else {
              collaborator_alive = collaborator_filtered;
              for (var i = 0; i < collaborator_alive.length; i++) {
                  var node = collaborator_alive[i];
                  var nodeID = getId(node);
                  $(nodeID).attr('opacity', opacity_highlight);
              }
          }
          // Go through all the other collabortors' characteristics, except for the original, and filtered
          $('[id$=-result]').each(function() {
              var name = $(this).attr('id');
              var index = name.indexOf('-');
              var cur = name.substring(0, index);
              if (cur == choice) return;
              else {
                  var inputs = [];
                  var original = getAllChoices('.' + cur + '-choices');
                  $(this).children().each(function() {
                      inputs.push($(this).text().toLowerCase());
                  });
                  if (inputs.length != 0) {
                      collaborator_alive = collaboratorFilteringFunction(collaborator_alive, cur, original, inputs);
                  }
              }
          });
          // Highlight the projects accordingly
          highlightProjects(collaborator_alive, project_filtered);
      }

      function collaboratorFilteringFunction(array, choice, original, inputs) {
          var temp = [];
          for (var i = 0; i < array.length; i++) {
              var node = array[i];
              var nodeID = getId(node);
              var option = options[choice];
              if(!option){
                option = choice;
              }
              var attributes = node[option];
              var decision = attributes.indexOf(',');
              if (decision != -1) {
                  var arr = [];
                  while (decision != -1) {
                      arr.push(attributes.substring(0, decision).toLowerCase());
                      attributes = attributes.substring(decision + 1, attributes.length);
                      decision = attributes.indexOf(',');
                  }
                  arr.push(attributes.toLowerCase());
                  attributes = arr;
              }
              if (Array.isArray(attributes)) {
                  for (var k = 0; k < attributes.length; k++) {
                      var attr = attributes[k];
                      attr = attr.toLowerCase().trim();
                      if (original.indexOf(attr) == -1) {
                          attr = 'other';
                      }
                      var result = inputs.indexOf(attr);
                      if (result != '-1') {
                          $(nodeID).attr('opacity', opacity_highlight);
                          temp.push(node);
                          break;
                      } else {
                          $(nodeID).attr('opacity', opacity_fade);
                      }
                  }
              } else {
                  var attr = attributes;
                  attr = attr.toLowerCase();
                  var check = original.indexOf(attr);
                  if (check == '-1') {
                      attr = 'other';
                  }
                  var result = inputs.indexOf(attr);
                  if (result != '-1') {
                      $(nodeID).attr('opacity', opacity_highlight);
                      temp.push(node);
                  } else {
                      $(nodeID).attr('opacity', opacity_fade);
                  }
              }
          }
          return temp;
      }

      function projectFilter(click) {
          collaborator_filtered = [];
          initialization();
          var original = getAllChoices('.project_outcome');
          var inputs = []; //user input
          var project_filtered = []; //keep projects filtered
          $('.project_outcome').each(function() {
              if ($(this).is(':checked')) {
                  inputs.push($(this).attr('id'));
              }
          });
          for (var i = 0; i < graph.nodes.length; i++) {
              var project_node = graph.nodes[i];
              var project_id = getId(project_node);
              if (project_node.type === 'Collaborator') {
                  continue;
              } else {
                  for (var j = 0; j < project_node.project_outcomes.length; j++) {
                      var outcome = project_node.project_outcomes[j];
                      outcome = outcome.replace(/ /g, '_');
                      outcome = outcome.replace('/', '_');
                      outcome = outcome.toLowerCase();
                      if (original.indexOf(outcome) == '-1') {
                          outcome = 'other';
                      }
                      var result = inputs.indexOf(outcome);
                      if (result != '-1') {
                          project_filtered.push(project_node);
                          break;
                      }
                  }
              }
          }
          // Year filter
          var duration = ($('#start_project').text());
          var start = duration.substring(0, 4);
          var end = duration.substring(7, 11);
          var temp = [];
          for (var i = 0; i < project_filtered.length; i++) {
              var project = project_filtered[i];
              var projectId = getId(project);
              var year = project.start_date;
              year = year.substring('5', '9');
              if (year >= start && year <= end) {
                  $(projectId).attr('opacity', opacity_highlight);
                  temp.push(project);
                  highlightNeighbours(project);
                  getCollaboratorFiltered();
              } else {
                  $(projectId).attr('opacity', opacity_fade);
              }
          }

          project_filtered = temp;

          collaborator_alive = collaborator_filtered;
          // GO thorugh each collaborator's characteristics and filter
          $('[id$=-result]').each(function() {
              var name = $(this).attr('id');
              var index = name.indexOf('-');
              var cur = name.substring(0, index);
              var inputs = [];
              var original = getAllChoices('.' + cur + '-choices');
              $(this).children().each(function() {
                  inputs.push($(this).text().toLowerCase());
              });
              if (inputs.length != 0) {
                  collaborator_alive = collaboratorFilteringFunction(collaborator_alive, cur, original, inputs);
                  highlightProjects(collaborator_alive, project_filtered);
              }
          });
          return project_filtered;
      }

      function getCollaboratorFiltered() {
          collaborator_filtered = [];
          for (var i = 0; i < graph.nodes.length; i++) {
              if (graph.nodes[i].type == 'Collaborator') {
                  var id = getId(graph.nodes[i]);
                  if ($(id).attr('opacity') == opacity_highlight) {
                      collaborator_filtered.push(graph.nodes[i]);
                  }
              }
          }
      }

      function highlightNeighbours(node, click) {
          for (var k = 0; k < graph.nodes.length; k++) {
              if (neighboring(graph.nodes[k], node) == '1') {
                  // Only work when user click on nodes
                  if (click) {
                      if (node.type == 'Collaborator') {
                          var index = project_filtered.indexOf(graph.nodes[k]);
                          if (index == '-1') {
                              continue;
                          }
                      }
                      if (node.type == 'Project') {
                          var index = collaborator_filtered.indexOf(graph.nodes[k]);
                          if (index == '-1') {
                              continue;
                          }
                      }
                  }
                  var id = getId(graph.nodes[k]);
                  $(id).attr('opacity', opacity_highlight);
                  path.style('stroke-width', function(l) {
                      if (graph.nodes[k] === l.source && node === l.target) {
                          $(this).attr('stroke-width', stroke_highlight);
                          return;
                      }
                  });
              }
          }
      }

      function highlightProjects(results, before) {
          for (var i = 0; i < graph.nodes.length; i++) {
              if (graph.nodes[i].type == 'Project') {
                  var id = getId(graph.nodes[i]);
                  $(id).attr('opacity', opacity_fade);
              }
          }
          path.style('stroke-width', function(l) {
              $(this).attr('stroke-width', stroke_fade);
          });
          for (var i = 0; i < results.length; i++) {
              var node = results[i];
              for (var k = 0; k < graph.nodes.length; k++) {
                  if (graph.nodes[k].type === 'Collaborator') continue;
                  var projectId = getId(graph.nodes[k]);
                  if (neighboring(graph.nodes[k], node) === 1) {
                      if (before.indexOf(graph.nodes[k]) == -1) continue;
                      $(projectId).attr('opacity', opacity_highlight);
                      path.style('stroke-width', function(l) {
                          if (node === l.source && graph.nodes[k] === l.target) {
                              $(this).attr('stroke-width', stroke_highlight);
                          }
                      });
                  }

              }
          }
      }

      ////////////////////////
      // Call for functions //
      ////////////////////////

      // Set the size of collaborator's circles in the legends when the page is load
      legendCollaborators();

      ///////////////
      // Functions //
      ///////////////

      // To check if one node and another node is connected
      function neighboring(a, b) {
          return a.index == b.index || linkedByIndex[a.index + "," + b.index];
      }

      function getId(node) {
          var tempo_id = node.id;
          var tempo_id = tempo_id.replace(/ /g, '_');
          var tempo_id = tempo_id.replace('/', '_');
          var tempo_id = '#' + tempo_id;
          return tempo_id;
      }

      function getAllChoices(array) {
          var original = [];
          if (array === '.project_outcome') {
              $(array).each(function() {
                  original.push($(this).attr('id'));
              })
          } else {
              $(array).each(function() {
                  original.push($(this).text().toLowerCase());
              })
          }
          return original;
      }

      function initialization() {
          for (var i = 0; i < graph.nodes.length; i++) {
              var id = getId(graph.nodes[i]);
              $(id).attr('opacity', opacity_fade);
          }
          path.style('stroke-width', function(l) {
              $(this).attr('stroke-width', stroke_fade);
          });
      }

      function trim(str) {
          if (str[0] == ' ') {
              str = str.substring(1);
              str = trim(str);
          }
          return str;
      }

      function legendCollaborators(){
        $('#legend-svg-1').attr('height', (Math.sqrt(2) * xScale(0.3) + projectRadius) * 2);
        $('#legend-circle-1').attr('cy', Math.sqrt(2) * xScale(0.3) + projectRadius);
        $('#legend-circle-1').attr('r', Math.sqrt(2) * xScale(0.3) + projectRadius);

        $('#legend-svg-2').attr('height', (Math.sqrt(4) * xScale(0.4) + projectRadius) * 2);
        $('#legend-circle-2').attr('cy', Math.sqrt(4) * xScale(0.4) + projectRadius);
        $('#legend-circle-2').attr('r', Math.sqrt(4) * xScale(0.4) + projectRadius);

        $('#legend-svg-3').attr('height', (Math.sqrt(6) * xScale(0.5) + projectRadius) * 2);
        $('#legend-circle-3').attr('cy', Math.sqrt(6) * xScale(0.5) + projectRadius);
        $('#legend-circle-3').attr('r', Math.sqrt(6) * xScale(0.5) + projectRadius);

        $('#legend-svg-1').attr('width', Math.sqrt(6) * xScale(0.6) + projectRadius);
        $('#legend-circle-1').attr('cx', Math.sqrt(6) * xScale(0.6) + projectRadius);

        $('#legend-svg-2').attr('width', Math.sqrt(6) * xScale(0.6) + projectRadius);
        $('#legend-circle-2').attr('cx', Math.sqrt(6) * xScale(0.6) + projectRadius);

        $('#legend-svg-3').attr('width', Math.sqrt(6) * xScale(0.6) + projectRadius);
        $('#legend-circle-3').attr('cx', Math.sqrt(6) * xScale(0.6) + projectRadius);
      }

      function sortArray(array){
        if(!Array.isArray(array)){
          array = array.split(',');
        }
        var result = array.sort();
        result = result.toString();
        return result;
      }

      /////////////////////////
      // JavaScript for bars //
      /////////////////////////

      $('.glyphicon-repeat').on('click', function() {
          refresh();
      });

      function refresh(){
        svg.call(zoom.transform, d3.zoomIdentity);
      }

      $('.side-menu button').on('click', function() {
          if ($(this).css('background-color') === 'rgb(255, 255, 255)') {
              $(this).css('background-color', 'black');
              $(this).css('color', 'white');
              var id = $(this).parent().attr('id');
              id = id.substr(0, id.indexOf('-'));
              id = id + '-result';
              var content = $(this).text();
              var li_id = content.replace('.', '_');
              var li_id = li_id.replace('/', '_');
              var li_id = li_id.replace(/ /g, '_');
              $('#' + id).append('<tag id="' + li_id + '">' + content + '</tag>');
          } else {
              $(this).css('background-color', 'white');
              $(this).css('color', 'black');
              var content = $(this).text();
              var li_id = content.replace('.', '_');
              var li_id = li_id.replace('/', '_');
              var li_id = li_id.replace(/ /g, '_');
              $('#' + li_id).remove();
          }
      });


      $('.tooltip').on('click', '.glyphicon-remove-circle', function() {
          $('.tooltip').children().remove();
          $('.tooltip').hide();
          project_filtered = projectFilter($(this).text());
      });

      // For safari
      $('.tooltip').on('click', '.glyphicon-remove-sign', function() {
          $('.tooltip').children().remove();
          $('.tooltip').hide();
          project_filtered = projectFilter($(this).text());
      });

  });

});
