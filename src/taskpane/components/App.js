import * as React from "react";
import Header from "./Header";
import Label from "./Label";
import Value from "./Value";
import HeroList, { HeroListItem } from "./HeroList";
import './App.css';
import { grupowanie } from './grupowanie.js';
import JSONTree from 'react-json-tree';
import Button from '@material-ui/core/Button';
import { getName } from './getname.js';
require('es6-promise').polyfill();
require('isomorphic-fetch');
var flatten = require('flat')
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
    // preparedData.type = sampledata['ado:publishing'].model._idclass;
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
      // object.type = oval._idclass;
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
    // preparedData.type = sampledata['ado:publishing'].object._idclass;
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
preparedData.objects=grupowanie(preparedData.objects);
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
export default class App extends React.Component
{
  constructor(props, context)
  {
    super(props, context);
    this.state = {
      listItems: [],
      fdata: {},
      arraytotableout:[],
      splitedelenments:[],
      key:0,
      searched2:'',
      visibility:true,
    };
  }
  componentDidMount ()
  {
    this.setState({
      listItems: [
        // {
        //   icon: "Ribbon",
        //   primaryText: "Achieve more with Office integration"
        // },
        // {
        //   icon: "Unlock",
        //   primaryText: "Unlock features and functionality"
        // },
        // {
        //   icon: "Design",
        //   primaryText: "Create and visualize like a pro"
        // }
      ]
    });
  }
  render ()
  {
    const { title, isOfficeInitialized } = this.props;
    const { fdata,arraytotableout,splitedelenments,searched2 } = this.state;
      const nodechecker = (a) =>
      {
        var renderuj=false;
          splitedelenments.forEach(element => {
            if( a.toString()!=='' && element.slice().reverse().toString().toUpperCase().includes(a.toString().toUpperCase())&& !element.slice().reverse().toString().toUpperCase().includes(('o'+a.toString()).toUpperCase()))
                      {
            renderuj=true;
          }
         });
         return renderuj;
      }
      const preparekeysforsearch = (key) =>
      {
var qq =flatten(fdata);
var splitedelenmentsinner=[]
 Object.keys(qq).forEach(element => {
  if (key!=='' && typeof qq[element] === 'string'&& qq[element].toUpperCase().includes(key.toUpperCase()))
  {
  splitedelenmentsinner.push(element.split('.'));
  }
 });
return splitedelenmentsinner;
      }
    const handleSubmit = (e) =>
    {
      e.stopPropagation();
      e.preventDefault();
      this.setState({ key: Math.random() });
      this.setState({ visibility: false });
      // fetch('https://10.0.7.141:8443/static/' + e.target.username.value + '.js')
      fetch('https://testfileserv.herokuapp.com/test.js')
      .then(function (response)
        {
          if (response.status >= 400)
          {
            throw new Error("Bad response from server");
          }
          return response.json();
        })
        .then(data =>
        {
          this.setState({ fdata: prepareData(data) });
        });
    };
    const handleSubmit2 = (e) =>
    {
      e.stopPropagation();
      e.preventDefault();
      this.setState({ key: Math.random() });
      var searched = e.target.username2.value;
   this.setState({ splitedelenments: preparekeysforsearch(searched)});
   this.setState({ searched2: searched});
    };
    const handleClick = (e) =>
    {
      e.stopPropagation();
      e.preventDefault();
  return Word.run(async context =>
  {
    var selectionRange = context.document.getSelection();
    selectionRange.insertText("{FOR model in models}\n\n{END-FOR model}");
    await context.sync();
  });
    };
    const theme = {
      scheme: 'monokai',
      author: 'wimer hazenberg (http://www.monokai.nl)',
      base00: '#FFFFFF',
      base01: '#000000',
      base02: '#000000',
      base03: '#000000',
      base04: '#000000',
      base05: '#000000',
      base06: '#000000',
      base07: '#000000',
      base08: '#000000',
      base09: '#000000',
      base0A: '#000000',
      base0B: '#000000',
      base0C: '#000000',
      base0D: '#000000',
      base0E: '#000000',
      base0F: '#000000'
    };
    return (
      <div className="ms-welcome">
        { this.state.visibility?
        <span style={{visibility: this.state.visibility}}>
                 <Header logo="./adonis.png" title={this.props.title} message="ADONIS Word Report Creator" />
        <HeroList message="Insert model ID for template preparation" items={this.state.listItems}>
        </HeroList>
        <form
          onSubmit={(e) => { handleSubmit(e) }}
        >
          <input
            id="username"
            name="username"
            type="text"
          />
          <button>Load model</button>
        </form>
        </span> :
        <span>
          <p>
          Place coursor in Word template in the left frame and click buttons in the right frame to insert ADONIS elements in the template. Blue buttons represent model attributes, red buttons represent objects in the model.
          </p>
          <Button onClick={(e) => { handleClick(e) }} color='primary' variant="contained">{getName('start')}</Button>
          </span>
  }
        <form
          onSubmit={(e) => { handleSubmit2(e) }}
        >
          <input
            id="username2"
            name="username2"
            type="text"
          />
          <button>Search</button>
        </form>
        <span style={{width: '100%'}}>
          <JSONTree
          key={this.state.key}
          data={fdata}
            hideRoot={true}
            theme={theme}
            invertTheme={false}
            shouldExpandNode={(a,b,c) => {
              let dorender = nodechecker(a)
return dorender;
            }}
            // labelRenderer={(raw, itemType) =>raw}
              // valueRenderer={raw => <span>{raw}</span>}
             labelRenderer={(raw, itemType) => <Label raw={raw} fdata={fdata} itemType={itemType} />}
              valueRenderer={raw => <Value raw={raw} searched2={searched2} />}
             getItemString={(type, data, itemType, itemString) => <span>{data.class || data.name}</span>}
          />
          </span>
      </div>
    );
  }
}
