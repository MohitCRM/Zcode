const validator = requre("validator")
const validate = (data)=>{
    const mandatoryfield = ['password','emailId','firstname']

    const isallowed = mandatoryfield.every((k)=>Object.keys(data).includes(k));

    if(!isallowed)
        throw new Error("Missing Field");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
}


module.exports = validate; 