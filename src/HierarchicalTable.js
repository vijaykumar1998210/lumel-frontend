import React, { useState } from 'react';

const rowsData = [
  {
    id: 'electronics',
    label: 'Electronics',
    value: 1500,
    children: [
      { id: 'phones', label: 'Phones', value: 800 },
      { id: 'laptops', label: 'Laptops', value: 700 },
    ],
  },
  {
    id: 'furniture',
    label: 'Furniture',
    value: 1000,
    children: [
      { id: 'tables', label: 'Tables', value: 300 },
      { id: 'chairs', label: 'Chairs', value: 700 },
    ],
  },
];

const TableRow = ({ row, updateValue }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAllocationPercent = () => {
    const percentage = parseFloat(inputValue);
    if (!isNaN(percentage)) {
      const newValue = row.value + (row.value * percentage) / 100;
      updateValue(row.id, newValue, 'percentage');
    }
  };

  const handleAllocationValue = () => {
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue)) {
      updateValue(row.id, newValue, 'value');
    }
  };

  return (
    <tr>
      <td>{row.label}</td>
      <td>{row.value.toFixed(2)}</td>
      <td>
        <input type='number' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      </td>
      <td>
        <button onClick={handleAllocationPercent}> Allocate %</button>
      </td>
      <td>
        <button onClick={handleAllocationValue}>Allocate Val</button>
      </td>
      <td>{(row.variance || 0).toFixed(2)}%</td>
    </tr>
  );
};

const HierarchicalTable = () => {
  const [data, setData] = useState(rowsData);

  const updateValue = (id, newValue, type) => {
    const updateHierarchy = (items) => {
      return items.map((item) => {
        if (item.id === id) {
          const oldValue = item.value;
          const newVariance = ((newValue - oldValue) / oldValue) * 100;

          if (item.children && type === 'value') {
            let totalOriginal = 0;
            for (const child of item.children) {
              totalOriginal += child.value;
            }

            const updatedChildren = item.children.map((child) => {
              const proportion = child.value / totalOriginal;
              const newChildValue = newValue * proportion;
              const childVariance = ((newChildValue - child.value) / child.value) * 100;
              return { ...child, value: newChildValue, variance: childVariance };
            });

            return { ...item, value: newValue, variance: 100, children: updatedChildren };
          }

          return { ...item, value: newValue, variance: newVariance };
        }

        if (item.children) {
          const updatedChildren = updateHierarchy(item.children);

          let newSubtotal = 0;
          let originalTotal = 0;
          for (const child of item.children) {
            originalTotal += child.value;
          }
          for (const child of updatedChildren) {
            newSubtotal += child.value;
          }

          const newVariance = ((newSubtotal - originalTotal) / originalTotal) * 100;
          return { ...item, children: updatedChildren, value: newSubtotal, variance: newVariance };
        }
        return item;
      });
    };

    setData(updateHierarchy(data));
  };

  return (
    <div style={{ padding:'30px'}}>
    <strong style={{ fontSize:'20px'}}>Hierarchical Table</strong>
    <table border='1'>
      <thead>
        <tr>
          <th>Label</th>
          <th>Value</th>
          <th>Input</th>
          <th>Allocation %</th>
          <th>Allocation Val</th>
          <th>Variance %</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <>
            <TableRow key={row.id} row={row} updateValue={updateValue} />
            {row.children &&
              row.children.map((child) => (
                <TableRow key={child.id} row={child} updateValue={updateValue} />
              ))}
          </>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default HierarchicalTable;
