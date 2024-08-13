interface Property {
  id: number;
  key: string;
}

interface Items {
  item: unknown[];
  key: string;
}

export const getItemById = (items: Items, property: Property) => {
  const itemDetails = items?.item?.find(
    (item) => item[items?.key] === property.id
  );
  return itemDetails ? itemDetails[property.key] : undefined;
};

// const getCountryName = (userId: number) => {
//     const userDetails = countries?.data?.find((item) => item?.oid == userId);
//     return userDetails?.countryName;
//   };
