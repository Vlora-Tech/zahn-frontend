import { Skeleton, TableCell, TableRow } from "@mui/material";

const TableRowsLoader = ({ rowsNum, colNums }) => {
  return [...Array(rowsNum)].map((row, index) => (
    <TableRow key={index}>
      {[...Array(colNums)].map((row, index) => (
        <TableCell key={`col-${index}`}>
          <Skeleton animation="wave" variant="text" />
        </TableCell>
      ))}
    </TableRow>
  ));
};

export default TableRowsLoader;
