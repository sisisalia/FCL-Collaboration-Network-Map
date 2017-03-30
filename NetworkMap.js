$( function() {


//    var width = $(window).width() + $(window).width()/3;
//    var height = $(window).height() + $(window).height()/6;

    var width = $(window).width();
    var height = $(window).height();

    var xScale = d3.scaleLinear().domain([0, 100]).range([0,width]);
    var yScale = d3.scaleLinear().domain([0, 100]).range([0,height]);

    width = width - xScale(20);
    height = height - yScale(10);

    $('#map').attr('width', width);
    $('#map').attr('height', height);
    $('#map').attr('viewBox','225 0 ' + xScale(200) + ' ' + yScale(130));
//    $('#map').css('border','1px solid black');
    $('#map').css('top', xScale(5) );
    $('#map').css('left', xScale(20) );

    var linkedByIndex = {};

    var svg = d3.select('svg'),
        width = +svg.attr('width'),
        height = +svg.attr('height');

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (d) {
                return d.id;
            }).distance(xScale(10)))
            .force('charge', d3.forceManyBody())
            .force("collide", d3.forceCollide(function (d) {
                if (d.type == 'Collaborator') return xScale(3);
                if (d.type == 'Project') return d.radius + xScale(3);
            }).iterations(16))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX().strength(.1))
            .force("y", d3.forceY().strength(.1))
            .on("tick", ticked)
        ;

    var path = svg.append('g').attr('class', 'link')
        .selectAll('path').data(graph.links).enter().append('path');

    var node = svg.selectAll('.node').data((graph.nodes)).enter().append('g').attr('class', 'nodes').call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
        .attr('fill', function (d) {
            if (d.type == 'Collaborator') {
                return 'black';
            }
            if (d.type == 'Project') {
                return color(d.id);
            }
        })
        .attr('opacity', 0.9)
        .attr('id', function(d){
            var id = d.id;
            var result = id.replace(/ /g,'_');
            var result = result.replace('/','_');
            return result;
        })
        .on("click", function (d) {
            $('.tooltip').remove();
            if (d.type === 'Project') {
                d3.select('body').append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0.9)
                    .html(
                        '<div id="project_tag">' +
                        '<table id="project_tag_table1">' +
                        '<tr>' +
                        '<td style="padding-right: 7px">' +
                        '<canvas id="myChart"></canvas>' + '</td>' +
                        '<td>' +
                        '<span id="project_tag_title">'+
                        d.id + '</span>' +'</td>' +'</tr>'+ '</table><table id="project_tag_table2">' +
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
                        d.project_duration+
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
                    )
                    .style("left",$(this).position().left + d.radius * xScale(0.8) + 'px')
                    .style("top", $(this).position().top + 'px');
            } else {
                d3.select('body').append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0.9)
                    .html(
                        '<div id="collaborator_tag">' +
                        '<table id="collaborator_tag_table1">' +
                        '<tr>' +
                        '<td>' +
                        '<svg id="collaborator_logo" height="15px" width="15px">' +
                        '<rect width="12" height="12" fill="black" />'+
                        '</svg>' + '</td>' +
                        '<td>' +
                        '<span id="collaborator_tag_title">'+
                        'ID ' +d.id + '</span>' +'</td>' +'</tr>'+ '</table><table id="collaborator_tag_table2">' +
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
                        d.research_group+
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
                    .style("left",$(this).position().left + 20 + 'px')
                    .style("top", $(this).position().top + 'px');
            }
            if(d.type == 'Project') {

                var ctx = $("#myChart");

                var percent = [];
                var color = [];

                for (var i = 0; i < d.pieChart.length; i++) {
                    percent.push(d.pieChart[i].percent);
                    color.push(d.pieChart[i].color);
                }

                var data = {
                    datasets: [
                        {
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

        })

        .on("mouseout", function () {
            $('svg').dblclick(function() {
                $('.tooltip').remove();
            });
        });

    node.append('path')
        .attr('d', d3.symbol()
            .size(xScale(30))
            .type(function (d) {
                if (d.type == 'Project') {
                    return d3.symbolCircle;
                } else if
                (d.type == 'Collaborator') {
                    return d3.symbolSquare;
                }
            }))
    ;

    node.each(function (d) {
        if (d.type == 'Project') {
            NodePieBuilder.drawNodePie(d3.select(this), d.pieChart, {
                parentNodeColor: color(d.id),
                outerStrokeWidth: 12,
                showLabelText: false,
                labelText: d.id,
                radius: d.radius * xScale(1),
                labelColor: color(d.id)
            });
        }
    });

    simulation.nodes(graph.nodes);

    simulation.force('link').links(graph.links);

    function ticked() {

        $('.link').show();

        var project_length = 0;
        var collaborator_length = 0;

        for ($i = 0; $i < graph.nodes.length; $i++) {
            if (graph.nodes[$i].type == 'Project') {
                project_length++;
            }
            else {
                collaborator_length++;
            }
        }

        var outer_angle = Math.PI * 2 / (collaborator_length);
        var inner_angle = Math.PI * 2 / (project_length);

        var x_outer = 0;
        var y_outer = 0;
        var x_inner = 0;
        var y_inner = 0;

        function translate_outer_x(d) {
            x_outer += outer_angle;
            d.x = Math.cos(x_outer) * xScale(60) + xScale(100);
            return Math.cos(x_outer) * xScale(60);
        }

        function translate_outer_y(d) {
            y_outer += outer_angle;
            d.y = Math.sin(y_outer) * yScale(100) + yScale(60);
            return Math.sin(y_outer) * yScale(100);
        }

        function translate_inner_x(d) {
            x_inner += inner_angle;
            d.x = Math.cos(x_inner) * xScale(25) + xScale(100);
            return Math.cos(x_inner) * xScale(25);
        }

        function translate_inner_y(d) {
            y_inner += inner_angle;
            d.y = Math.sin(y_inner) * yScale(40) + yScale(60);
            return Math.sin(y_inner) * yScale(40);
        }

        node
            .attr("transform", function (d) {
                if (d.type == 'Project') {
                    return "translate(" + translate_inner_x(d) + "," + translate_inner_y(d) + ")";
                }
                if (d.type == 'Collaborator') {
                    return "translate(" + translate_outer_x(d) + "," + translate_outer_y(d) + ")";
                }
            });

        node.transition().duration(50).attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });


        path.transition().duration(50).attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        graph.links.forEach(function (d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
            linkedByIndex[d.target.index + "," + d.source.index] = 1;
        });
        simulation.alpha(1.0);
    }

//    d3.select(window).on('resize', resize);

    function neighboring(a, b) {
        return a.index == b.index || linkedByIndex[a.index + "," + b.index];
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function getFociMap(items) {
        var map = {};
        var baseX = 300;
        var baseY = 50;
        var dy = 60;
        var dx = 0;

        for (i = 0; i < items.length; i++) {
            y = baseY + (i * dy);
            map[items[i]] = {x: baseX + (i * dx), y: baseY + (i * dy)};
        }

        return map;
    }

    function getProjects(items) {
        projects = [];
        for (i = 0; i < items.length; i++) {
            if (projects.indexOf(items[i].research_group) < 0) {
                projects.push(items[i].research_group);
            }
        }
        return projects;
    }

//    function resize(){
//
//        var width = $(window).width();
//        var height = $(window).height();
//
//        $('#map').attr('width', width);
//        $('#map').attr('height', height);
//
//        var svg = d3.select('svg'),
//            width = +svg.attr('width'),
//            height = +svg.attr('height');
//
//        var xScale = d3.scaleLinear().domain([0, 100]).range([0,width]);
//        var yScale = d3.scaleLinear().domain([0, 100]).range([0,height]);
//
//        simulation.alpha(1.0).restart();
//
//    }
});
