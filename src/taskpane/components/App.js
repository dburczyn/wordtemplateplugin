import * as React from "react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import './App.css';
import JSONTree from 'react-json-tree';
import Button from '@material-ui/core/Button';
import ImageIcon from '@material-ui/icons/Image';
require('es6-promise').polyfill();
require('isomorphic-fetch');

function getAttrs (val)
{
  const result = [];
  function getAttrsInn (obj)
  {
    for (const prop in obj)
    {
      const value = obj[prop];
      if (typeof value === 'object')
      {
        getAttrsInn(value);
      }
      else if (prop === '_controltype')
      {
        result.push(obj);
      }
    }
  }
  getAttrsInn(val);
  return result;
}
function prepareData (sampledata)
{
  var preparedData = {};
  if (sampledata['ado:publishing'].hasOwnProperty('model'))
  {
    preparedData.name = sampledata['ado:publishing'].model._name;
    preparedData.class = sampledata['ado:publishing'].model._class;
    preparedData.images = sampledata.images;
    preparedData.chapters = [];
    for (let [index, val] of sampledata['ado:publishing'].model.notebook.chapter.entries())
    {
      var chapter = {};
      chapter.name = val._name;
      chapter.attributes = [];
      var attributes = getAttrs(val);
      for (let [i, aval] of attributes.entries())
      {
        var attri = {};
        if (aval.hasOwnProperty('_name'))
        {
          attri.name = aval._name;
          attri.value = getValue(aval);
          attri.searchname = aval._idname;
          if (attri.searchname !== 'INSTANCE_CHANGE_HISTORY')
          {
            chapter.attributes.push(attri);
          }
        } else if (aval.hasOwnProperty('_class'))
        {
          attri.name = aval._class;
          attri.searchname = aval._idclass;
          attri.value = getValue(aval);
          chapter.attributes.push(attri);
        } else
        {
          attri.name = "noname";
          attri.value = "noval";
          chapter.attributes.push(attri);
        }
      }
      preparedData.chapters[index] = chapter;
    }
    preparedData.objects = [];
    for (let [oindex, oval] of sampledata['ado:publishing'].model.object.entries())
    {
      var object = {};
      object.name = oval._name;
      object.class = oval._class;
      object.ochapters = [];
      for (let [index, val] of oval.notebook.chapter.entries())
      {
        var ochapter = {};
        ochapter.name = val._name;
        ochapter.attributes = [];
        var oattributes = getAttrs(val);
        for (let [i, aval] of oattributes.entries())
        {
          var oattri = {};
          if (aval.hasOwnProperty('_name'))
          {
            oattri.name = aval._name;
            oattri.value = getValue(aval);
            oattri.searchname = aval._idname;
            if (oattri.searchname !== 'INSTANCE_CHANGE_HISTORY')
            {
              ochapter.attributes.push(oattri);
            }
          } else if (aval.hasOwnProperty('_class'))
          {
            oattri.name = aval._class;
            oattri.searchname = aval._idclass;
            oattri.value = getValue(aval);
            ochapter.attributes.push(oattri);
          } else
          {
            oattri.name = "noname";
            oattri.value = "noval";
            ochapter.attributes.push(oattri);
          }
        }
        object.ochapters[index] = ochapter;
      }
      preparedData.objects[oindex] = object;
    }
    preparedData.objects.sort(function (a, b)
    {
      return ('' + a.name).localeCompare(('' + b.name));
    });
  } else if (sampledata['ado:publishing'].hasOwnProperty('object'))
  {
    preparedData.name = sampledata['ado:publishing'].object._name;
    preparedData.class = sampledata['ado:publishing'].object._class;
    preparedData.images = "";
    preparedData.chapters = [];
    for (let [index, val] of sampledata['ado:publishing'].object.notebook.chapter.entries())
    {
      var sochapter = {};
      sochapter.name = val._name;
      sochapter.attributes = [];
      var soattributes = getAttrs(val);
      for (let [i, aval] of soattributes.entries())
      {
        var soattri = {};
        if (aval.hasOwnProperty('_name'))
        {
          soattri.name = aval._name;
          soattri.value = getValue(aval);
          soattri.searchname = aval._idname;
          sochapter.attributes.push(soattri);
        } else if (aval.hasOwnProperty('_class'))
        {
          soattri.name = aval._class;
          soattri.searchname = aval._idclass;
          soattri.value = getValue(aval);
          sochapter.attributes.push(soattri);
        } else
        {
          soattri.name = "noname";
          soattri.value = "noval";
          sochapter.attributes.push(soattri);
        }
      }
      preparedData.chapters[index] = sochapter;
    }
    preparedData.objects = [];
  }
  return preparedData;
}
function getComplexVals (passedval, passedinp)
{
  var vals = [];
  if (passedinp.hasOwnProperty('complexvalues') && passedinp.complexvalues.hasOwnProperty('member'))
  {
    if (!Array.isArray(passedinp.complexvalues.member))
    {
      for (let [i, val2] of passedinp.complexvalues.member.complexvalues.member.entries())
      {
        if (val2._name === passedval._name)
        {
          vals.push(getValue(val2));
        }
      }
    }
    else if (Array.isArray(passedinp.complexvalues.member))
    {
      for (let [i, val] of passedinp.complexvalues.member.entries())
      {
        for (let [i, val2] of val.complexvalues.member.entries())
        {
          if (val2._name === passedval._name)
          {
            vals.push(getValue(val2));
          }
        }
      }
    }
  }
  return vals;
}
function getComplex (inp)
{
  if (inp.hasOwnProperty('columns'))
  {
    var complexarray = [];
    for (let [i, val] of inp.columns.member.entries())
    {
      var complexmember = {};
      complexmember.name = val._name;
      complexmember.values = getComplexVals(val, inp);
      complexarray.push(complexmember);
    }
    return complexarray;
  }
}
function getValue (inp)
{
  if (inp.hasOwnProperty('attrval'))
  {
    if (inp.attrval.attrvaltype._type === 'ENUM')
    {
      return (inp.attrval._name);
    } else if (inp.attrval.attrvaltype._type === 'BOOL')
    {
      return (inp.attrval.value === 0 ? "nie" : "tak");
    } else if (inp.attrval.attrvaltype._type === 'LONGSTRING' || inp.attrval.attrvaltype._type === 'UNSIGNED INTEGER' || inp.attrval.attrvaltype._type === 'FILE_POINTER' || inp.attrval.attrvaltype._type === 'SHORTSTRING' || inp.attrval.attrvaltype._type === 'INTEGER' || inp.attrval.attrvaltype._type === 'ADOSTRING' || inp.attrval.attrvaltype._type === 'STRING')
    {
      return (inp.attrval.value.hasOwnProperty('p') ? inp.attrval.value.p : inp.attrval.value);
    }
    else if (inp.attrval.attrvaltype._type === 'DOUBLE' || inp.attrval.attrvaltype._type === 'UTC')
    {
      return (inp.attrval["alternate-value"] || inp.attrval.value);
    } else if (inp.attrval.attrvaltype._type === 'INTERREF')
    {
      if (inp.attrval.relation.hasOwnProperty('link'))
      {
        return (inp.attrval.relation.link.endpoint._name);
      }
    } else
    {
      return inp.attrval.attrvaltype._type;
    }
  }
  else if (inp._type === 'FILE_POINTER')
  {
    var splited = inp.value.param.split('/');
    return splited[splited.length - 1];
  }

  else if (inp.hasOwnProperty('link') && inp.link.hasOwnProperty('endpoint'))
  {
    return (inp.link.endpoint._name);
  } else if (inp.hasOwnProperty('link') && Array.isArray(inp.link))
  {
    var ret = '';
    for (let [i, val] of inp.link.entries())
    {
      ret = ret + '\u2022' + val.endpoint._name + '\n';
    }
    return ret.replace(/^\s+|\s+$/g, "");
  } else if (inp._complex === 1)
  {
    return getComplex(inp);
  } else
  {
    return "";
  }
}
const handleClick = async (e, f, data) =>
{
  e.stopPropagation();
  e.preventDefault();
  if (f[f.length - 1] !== 'model')
  {
    f.push("model");
  }
  const prepareddata = {};
  prepareddata.model = data;
  prepareddata.images = "";
  var ref = f.reduceRight((o, i) => o[i], prepareddata);
  return Word.run(async context =>
  {


    var selectionRange = context.document.getSelection();


    if (Array.isArray(ref))
    {
      if (f.length === 2)
      {
        selectionRange.insertText("{FOR " + f[0] + " in " + f[1] + "." + f[0] + "}\n\n{END-FOR " + f[0] + "}", "After");
      }
      else
      {
        selectionRange.insertText("{FOR " + f[0] + " in $" + f[2] + "." + f[0] + "}\n\n{END-FOR " + f[0] + "}", "After");
      }
    }
    ///// end arrays ///
    ///// searchname ////
    else if (f[f.length - 2] !== 'objects' && f[0] === 'searchname')
    {
      selectionRange.insertText("{IF typeof gV(model, '" + ref + "') !== 'object'}{gV(model, '" + ref + "')}{END-IF}", "After");
    }
    else if (f[f.length - 2] === 'objects' && f[0] === 'searchname')
    {
      selectionRange.insertText("{IF typeof gV($objects, '" + ref + "') !== 'object'}{gV($objects, '" + ref + "')}{END-IF}", "After");
    }
    ///// searchname ////
    ///// root////
    else if (f.length === 2 && f[0] === 'name')
    {
      selectionRange.insertText("{model.name}", "After");
    }
    else if (f.length === 2 && f[0] === 'class')
    {
      selectionRange.insertText("{model.class}", "After");
    }
    else if (f.length === 2 && f[0] === 'images')
    {
      selectionRange.insertText("{FOR image IN model.images}\n{IMAGE insertImg($image,25)}\n{END-FOR image}", "After");
    }
    ///// root////
    /// atriname///
    else if (!isNaN(f[1]) && f[0] === 'name')
    {
      selectionRange.insertText("{$" + f[2] + ".name}", "After");
    }
    ////////////////////
    ///attrivalue///
    else if (!isNaN(f[1]) && f[0] === 'value')
    {
      selectionRange.insertText("{IF typeof $" + f[2] + ".value !== 'object'}{$" + f[2] + ".value}{END-IF}", "After");
    }
    //////////////////
    ////objectclass////
    else if (!isNaN(f[1]) && f[0] === 'class')
    {
      selectionRange.insertText("{$" + f[2] + ".class}", "After");
    }
    await context.sync();
  });
};


export default class App extends React.Component
{
  constructor(props, context)
  {
    super(props, context);
    this.state = {
      listItems: [],
      fdata: {}
    };
  }
  componentDidMount ()
  {
    this.setState({
      listItems: [
        {
          icon: "Ribbon",
          primaryText: "Achieve more with ADONIS NP integration"
        },
        {
          icon: "Unlock",
          primaryText: "Unlock features and functionality"
        },
        {
          icon: "Design",
          primaryText: "Create and visualize like a pro"
        }
      ]
    });

  }
  render ()
  {
    const { title, isOfficeInitialized } = this.props;
    const { fdata } = this.state;
    const handleSubmit = (e) =>
    {
      e.stopPropagation();
      e.preventDefault();
      fetch('/static/' + e.target.username.value + '.js')
        .then(function (response)
        {
          if (response.status >= 400)
          {
            alert("Cannot get structure (wrong filename?)");
          }
          return response.json();
        })
        .then(data =>
        {
          this.setState({ fdata: prepareData(data) });
        });
    };
    if (!isOfficeInitialized)
    {
      return (<Progress title={title} logo="assets/logo-filled.png" message="Please sideload your addin to see app body." />
      );
    }
    return (
      <div className="ms-welcome">

        <Header logo="static/adonis.png" title={"ADONIS"} message="Welcome" />
        <HeroList message="Design your own ADONIS NP report!" items={this.state.listItems} >
          <p className="ms-font-l">Select structure file name.</p>
          <form style={{ textAlign: "center" }}
            onSubmit={(e) => { handleSubmit(e) }}
          >
            <input
              id="username"
              name="username"
              type="text"
            />
            <button>Get structure!</button>
          </form>
          <JSONTree data={fdata}
            hideRoot={true}
            labelRenderer={raw => <div style={{ width: '10em' }}>{isNaN(raw[0]) ? <Button variant="contained" color={isNaN(raw[0]) ? "primary" : "disabled"} onClick={(e) => { handleClick(e, raw, fdata) }} >{raw[0]}</Button> : <div>{raw[0]}</div>}</div>}
            valueRenderer={raw => <em>{raw !== 'undefined' ? <em>{raw}</em> : <em><ImageIcon color="primary" /></em>}</em>} />

        </HeroList>
      </div>
    );
  }
}
