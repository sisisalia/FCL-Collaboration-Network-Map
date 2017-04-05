////////////////////////

//Year filter
$("#start_project").bind('contentchanged',function(){
    var duration = ($(this).text());
    var start = duration.substring( 0, 4);
    var end = duration.substring(7, 11);
    initialization();
    for(var i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].type === 'Collaborator') continue;
        var project = graph.nodes[i];
        var projectId = getId(project);
        var year = project.start_date;
        year = year.substring('5', '9');
        if (year >= start && year <= end) {
            $(projectId).attr('opacity', '0.9');
            highlightCollaborators(project);
        }
    }
});

$('.project_outcome, .disciplines-choices, .fcl_project-choices, .location-choices, .language-choices').on('click',function(){
  filter($(this).text());
});

function filter(text){
  var project_filtered;
  var collaborator_filtered;
  project_filtered = projectOutcomeFilter();
  collaborator_filtered = disciplinesFilter(project_filtered, text);
  //        var blalbalalb = fclProjectFilter(project_filtered, $(this).text().toLowerCase());
}

function fclProjectFilter(project_filtered, click)
{
    var original = getAllChoices('.fcl_project-choices');
    var inputs = [];
    var results = [];   //keep the node result
    $('#fcl_project-result').children('tag').each(function(){
        inputs.push($(this).text().toLowerCase());
    });
    if(click != "" && original.indexOf(click) != -1) {
        var inside = inputs.indexOf(click);
        if (inside == '-1') {
            inputs.push(click);
        } else {
            inputs.splice(inside, 1);
        }
        for(var i = 0; i < graph.nodes.length; i++){
            var collaborator_node = graph.nodes[i];
            var collaborator_id = getId(collaborator_node);
            if($(collaborator_id).attr('opacity') === '0.2') {
                continue;
            }
            if(collaborator_node.type === 'Project') continue;
            else{
                var group = collaborator_node.research_group;
                group = group.toLowerCase();
                var check = original.indexOf(group);
                if (check == '-1'){
                    group = 'other';
                }
                var result = inputs.indexOf(group);
                if (result != '-1'){
                    $(collaborator_id).attr('opacity','0.9');
                    results.push(collaborator_node);
                }else{
                    $(collaborator_id).attr('opacity', '0.2');
                }
                }
            }
        }
        highlightProjects(results, project_filtered);
    return results;
}

function disciplinesFilter(project_filtered, click){
    var original = getAllChoices('.disciplines-choices');
    if( click != 'project'){
      var click = click.toLowerCase();
    }
    var inputs = [];
    var results = [];   //keep the node result
    $('#disciplines-result').children('tag').each(function(){
        inputs.push($(this).text().toLowerCase());
    });
    if((click != "" && original.indexOf(click) != -1)) {
          var inside = inputs.indexOf(click);
          if (inside == '-1') {
              inputs.push(click);
          } else {
              inputs.splice(inside, 1);
          }
        for(var i = 0; i < graph.nodes.length; i++){
            var collaborator_node = graph.nodes[i];
            var collaborator_id = getId(collaborator_node);
            if($(collaborator_id).attr('opacity') === '0.2') {
                continue;
            }
            if(collaborator_node.type === 'Project') continue;
            else{
                var disciplinaries = collaborator_node.disciplinary_backgrounds;
                for(var k = 0; k < disciplinaries.length; k++){
                    var disciplinary = disciplinaries[k];
                    disciplinary = disciplinary.toLowerCase();
                    var check = original.indexOf(disciplinary);
                    if (check == '-1'){
                        disciplinary = 'other';
                    }
                    var result = inputs.indexOf(disciplinary);
                    if (result != '-1'){
                        $(collaborator_id).attr('opacity','0.9');
                        results.push(collaborator_node);
                        break;
                    }else{
                        $(collaborator_id).attr('opacity', '0.2');
                    }
                }
            }
        }
        highlightProjects(results, project_filtered);
    }
    // if ( click == 'project'){
    //   alert('hello');
    // }
    if (inputs.length == 0 && click != 'project'){
      projectOutcomeFilter();
    }
    return results;
}

function projectOutcomeFilter(){
    initialization();
    var original = getAllChoices('.project_outcome');
    var inputs = [];    //user input
    var project_filtered = [];    //keep projects filtered
    $('.project_outcome').each(function(){
        if($(this).is(':checked')){
            inputs.push($(this).attr('id'));
        }
    });
    for(var i = 0; i < graph.nodes.length; i++){
        var project_node = graph.nodes[i];
        var project_id = getId(project_node);
        if(project_node.type === 'Collaborator') {
            continue;
        }
        else{
            for(var j = 0; j < project_node.project_outcomes.length; j++){
                var outcome = project_node.project_outcomes[j];
                outcome = outcome.replace(/ /g, '_');
                outcome = outcome.replace('/','_');
                outcome = outcome.toLowerCase();
                if( original.indexOf(outcome) == '-1'){
                    outcome = 'other';
                }
                var result = inputs.indexOf(outcome);
                if(result != '-1'){
                    project_filtered.push(project_node);
                    $(project_id).attr('opacity','0.9');
                    highlightCollaborators(project_node);
                    break;
                }
            }
        }
    }
    // var count = 0;
    // $('tag').each(function(){
    //   count++;
    // })
    // if(count != 0){
    //   alert('inside')
    //   disciplinesFilter(project_filtered, 'project');
    // }
    return project_filtered;
}

function highlightCollaborators(node){
    for(var k = 0; k < graph.nodes.length; k++){
        if(neighboring(graph.nodes[k], node) == '1'){
            var collaboratorId = getId(graph.nodes[k]);
            $(collaboratorId).attr('opacity','0.9');
            path.style('stroke-width', function (l) {
                if (graph.nodes[k] === l.source && node === l.target) {
                    $(this).attr('stroke-width', '3');
                    return;
                }
            });
        }
    }
}

function highlightProjects(results, before){
    for( var i = 0; i < graph.nodes.length; i++){
        if( graph.nodes[i].type == 'Project'){
            var id = getId(graph.nodes[i]);
            $(id).attr('opacity','0.2');
        }
    }
    path.style('stroke-width', function (l) {
        $(this).attr('stroke-width', '1');
    });
    for(var i = 0; i < results.length; i++) {
        var node = results[i];
        for (var k = 0; k < graph.nodes.length; k++) {
            if (graph.nodes[k].type === 'Collaborator') continue;
            var projectId = getId(graph.nodes[k]);
                if (neighboring(graph.nodes[k], node) === 1) {
                    if(before.indexOf(graph.nodes[k]) == -1) continue;
                    $(projectId).attr('opacity', '0.9');
                    path.style('stroke-width', function (l) {
                        if (node === l.source && graph.nodes[k] === l.target) {
                            $(this).attr('stroke-width', '3');
                        }
                    });
                }

        }
    }
}

//location filter
$('.location-choices').on('click',function(){
  initialization();
  var original = getAllChoices('.location-choices');
  var inputs = [];
  $('#location-result').children('tag').each(function(){
      inputs.push($(this).text().toLowerCase());
  })
  var inside = inputs.indexOf($(this).text().toLowerCase());
  if( inside == '-1'){
      inputs.push($(this).text().toLowerCase());
  }else{
      inputs.splice(inside, 1);
  }
  if(inputs.length === 0){
      refresh();
  }
  for(var i = 0; i < graph.nodes.length; i++){
      var node = graph.nodes[i];
      if(node.type === 'Project') continue;
      else{
          var locations = node.locations;
          locations = locations.split(",");
          for(var k = 0; k < locations.length; k++){
              var location = locations[k];
              location = trim(location);
              location = location.toLowerCase();
              var result = inputs.indexOf(location);
              if (result != '-1'){
                  var id = getId(node);
                  highlightProjects(node);
                  break;
              }
          }
      }
  }
});

//language filter
$('.language-choices').on('click',function(){
  initialization();
  var original = getAllChoices('.language-choices');
  var inputs = [];
  $('#language-result').children('tag').each(function(){
      inputs.push($(this).text().toLowerCase());
  })
  var inside = inputs.indexOf($(this).text().toLowerCase());
  if( inside == '-1'){
      inputs.push($(this).text().toLowerCase());
  }else{
      inputs.splice(inside, 1);
  }
  if(inputs.length === 0){
      refresh();
  }
  for(var i = 0; i < graph.nodes.length; i++){
      var node = graph.nodes[i];
      if(node.type === 'Project') continue;
      else{
          var languages = node.mother_tongues;
          languages = languages.split(",");
          for(var k = 0; k < languages.length; k++){
              var language = languages[k];
              language = trim(language);
              language = language.toLowerCase();
              var check = original.indexOf(language);
              if (check == '-1'){
                  language = 'others';
              }
              var result = inputs.indexOf(language);
              if (result != '-1'){
                  var id = getId(node);
                  highlightProjects(node);
                  break;
              }
          }
      }
  }
});

$('.glyphicon-repeat').on('click',function(){
  reload();
});

function getId(node){
    var tempo_id = node.id;
    var tempo_id = tempo_id.replace(/ /g,'_');
    var tempo_id = tempo_id.replace('/','_');
    var tempo_id = '#' + tempo_id;
    return tempo_id;
}

function getAllChoices(array){
    var original = [];
    if(array === '.project_outcome') {
        $(array).each(function () {
            original.push($(this).attr('id'));
        })
    }
    else{
        $(array).each(function(){
            original.push($(this).text().toLowerCase());
        })
    }
    return original;
}

function initialization(){
    for(var i = 0; i < graph.nodes.length; i++){
        var id = getId(graph.nodes[i]);
        $(id).attr('opacity','0.2');
    }
    path.style('stroke-width', function (l) {
        $(this).attr('stroke-width', '1');
    });
}

function refresh(){
    for(var i = 0; i < graph.nodes.length; i++){
        var id = getId(graph.nodes[i]);
        $(id).attr('opacity','0.9');
    }
    path.style('stroke-width', function (l) {
        $(this).attr('stroke-width', '1');
    });
}

function trim(str){
  if(str[0] == ' '){
    str = str.substring(1);
    str = trim(str);
  }
  return str;
}

function reload(){
  refresh();
  $('.menu-list').hide();
  $('.main-menu').show();
  $('.glyphicon-menu-left').show();
  $('.side-menu').hide();
  $('.arrow').removeClass('glyphicon-menu-up');
  $('.arrow').addClass('glyphicon-menu-down');
  $('.project_outcome').each(function(){
    $(this).prop('checked',true);
  });
  $('[class$=-choices]').each(function(){
    $(this).css('background-color','white');
    $(this).css('color', 'black');
  })
  $('[id$=-result]').each(function(){
    $(this).children().remove();
  })
  $("#slider-range").slider({
      values: [2015, 2020]
  });
  $('#start_project').text('2015 - 2020');
}
