import * as React from "react";
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { getName } from './getname.js';
function handleClick (e, f, data)
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
  var arrtorefup = f.slice();
  arrtorefup.shift();

  var refup = arrtorefup.reduceRight((o, i) => o[i], prepareddata);
  // console.log(typeof f)
  // console.log(typeof f[0])
  // console.log(f.shift())
  // console.log(typeof f.searchname)
  // console.log(typeof f.value)
  var ref = f.reduceRight((o, i) => o[i], prepareddata);

  // console.log("ref: " + ref)
  //  console.log("f: " + f)
  // console.log("refup: " + refup)
  // console.log("refup searchame: " + refup.searchname)
  // console.log("refup name: " + refup.name)
  // console.log("refup value: " + refup.value)
  return Word.run(async context =>
  {
    var selectionRange = context.document.getSelection();
    if (f.length === 6  && f[0]==='name' && f[2]==='ochapters')
    {
        // if (refup && refup.attributes && refup.attributes[0] &&  refup.attributes[0].searchname)
        // {
        // selectionRange.insertText("{gChN($objects, '" + refup.attributes[0].searchname + "')}", "After");
        // }
        // else{
          selectionRange.insertText(ref);
        // }
    }
    else if (f.length === 4 && f[0]==='name' && f[2]==='chapters')
    {
        // if (refup && refup.attributes && refup.attributes[0] &&  refup.attributes[0].searchname)
        // {
        // selectionRange.insertText("{gChN(model, '" + refup.attributes[0].searchname + "')}", "After");
        // }
        // else{
          selectionRange.insertText(ref);
        // }
    }

      else if (f.length === 2 && f[0] === 'name')
    {
      selectionRange.insertText("{$model.name}", "After");
    }
    else if (f.length === 4 && f[f.length - 2] === 'objects' && f[0] === 'name')
    {
      selectionRange.insertText("{$objects.name}", "After");
    }
    else if (f.length === 2 && f[0] === 'class')
    {
      selectionRange.insertText("{$model.class}", "After");
    }
    else if (f.length === 2 && f[0] === 'images')
    {
      selectionRange.insertText("{FOR image IN model.images}\n{IMAGE insertImg($image,25)}\n{END-FOR image}", "After");
    }
    // else if (!isNaN(f[1]) && f[0] === 'name')
    // {
    //   selectionRange.insertText("{$" + f[2] + ".name}", "After");
    // }
    // else if (!isNaN(f[1]) && f[0] === 'value')
    // {
    //   selectionRange.insertText("{IF typeof $" + f[2] + ".value !== 'object'}{$" + f[2] + ".value}{END-IF}", "After");
    // }
    else if (f[f.length - 2] !== 'objects' &&  (f[0] === 'searchname' || f[0] === 'name'))
    {
      selectionRange.insertText("{IF typeof gN($model, '" + refup.searchname + "') !== 'object'}{gN($model, '" + refup.searchname + "')}{END-IF}", "After");
    }
    else if (f[f.length - 2] === 'objects' && (f[0] === 'searchname' || f[0] === 'name' ))
    {
      selectionRange.insertText("{IF typeof gN($objects, '" + refup.searchname + "') !== 'object'}{gN($objects, '" + refup.searchname + "')}{END-IF}", "After");
    }
    else if (f[f.length - 2] !== 'objects' &&  (f[0] === 'searchname' ||  f[0] === 'value'))
    {
      selectionRange.insertText("{IF typeof gV($model, '" + refup.searchname + "') !== 'object'}{gV($model, '" + refup.searchname + "')}{END-IF}", "After");
    }
    else if (f[f.length - 2] === 'objects' && (f[0] === 'searchname' || f[0] === 'value'))
    {
      selectionRange.insertText("{IF typeof gV($objects, '" + refup.searchname + "') !== 'object'}{gV($objects, '" + refup.searchname + "')}{END-IF}", "After");
    }
    else if (!isNaN(f[1]) && f[0] === 'class')
    {
      selectionRange.insertText("{$" + f[2] + ".class}", "After");
    }
    else if (f[0] === 'objects')
    {
      selectionRange.insertText("{FOR objects in $model.objects}\n\n{END-FOR objects}", "After");
    }

    await context.sync();
  });
}
export default class Label extends React.Component
{
  constructor(props, context)
  {
    super(props, context);
    this.state = { itemType: props.itemType, raw: props.raw, fdata: props.fdata};
  }

  render ()
  {
    const { itemType, fdata, raw} = this.state;
    if (raw && isNaN(raw[0]) && raw[0]==='searchname')
    {return (
    null
      ); }
    else if (raw&&isNaN(raw[0]) && raw[raw.length - 1] !== 'objects' && itemType === 'Array')
    {
      return (
        <span>
          {/* <Button onClick={(e) => { handleClick(e, raw, fdata) }} color='primary' variant="contained">{getName(raw[0])}</Button> */}
          {getName(raw[0])}
        </span>
      );
    }
    // else if (raw&&isNaN(raw[0]) && raw[0] === 'objects' && itemType === 'Array')
    else if (raw&&isNaN(raw[0]) && raw[0] === 'objects')
    {
      return (
        <span>
          <Button onClick={(e) => { handleClick(e, raw, fdata) }} color='secondary' variant="contained">{getName(raw[0])}</Button>
          {/* {getName(raw[0])} */}
        </span>
      );
    }
    else if (raw && isNaN(raw[0]) && itemType === 'Array')
      return (
        <span>
          {/* <Button onClick={(e) => { handleClick(e, raw, fdata) }} color='secondary' variant="contained">{getName(raw[0])}</Button> */}
          {getName(raw[0])}
        </span>
      );
    else if (raw && isNaN(raw[0]) && raw[raw.length - 1] !== 'objects' && raw[0]!=='type')
    {
      return (
        <span>
        <Button onClick={(e) => { handleClick(e, raw, fdata) }} color='primary' variant="contained">{getName(raw[0])}</Button>
        <IconButton ></IconButton>
        </span>
        );
    }
    // else if (raw && isNaN(raw[0]) && raw[0]!=='type')
    else if (raw && isNaN(raw[0]) )
      return (
        <span>
        <Button onClick={(e) => { handleClick(e, raw, fdata) }} color='secondary' variant="contained">{getName(raw[0])}</Button>
        <IconButton ></IconButton>
        </span>
        );

    return <span></span>
  }
}
