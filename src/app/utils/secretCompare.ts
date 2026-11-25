import secretHash from "./secretHash";

const secretCompare = (plainSecret: string, hashedSecret: string): boolean => {
  return secretHash(plainSecret) === hashedSecret;
};

export default secretCompare;
