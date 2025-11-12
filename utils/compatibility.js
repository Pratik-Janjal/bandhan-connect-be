export const calculateCompatibility = (userA, userB) => {
    let score = 0;
  
    const ageDiff = Math.abs(userA.age - userB.age);
    if (ageDiff <= 3) score += 25;
    else if (ageDiff <= 7) score += 15;
    else if (ageDiff <= 10) score += 5;
  
   
    if (userA.location && userA.location === userB.location) score += 20;
  
 
    if (userA.education && userA.education === userB.education) score += 15;
  

    if (userA.profession && userA.profession === userB.profession) score += 15;

    if (userA.religion && userA.religion === userB.religion) score += 10;
  
    if (userA.interests?.length && userB.interests?.length) {
      const common = userA.interests.filter((i) => userB.interests.includes(i));
      const overlap =
        (common.length /
          Math.max(userA.interests.length, userB.interests.length)) *
        15;
      score += overlap;
    }
 
    if (score <= 50) {
      score += 45;
    }
  
    return Math.min(100, Math.round(score));
  };
  