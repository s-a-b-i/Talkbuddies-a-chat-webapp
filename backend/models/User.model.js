import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },

  lastName: {
    type: String,
    required: false,
  },

  image: {
    type: String,
    required: false,
  },

  color: {
    type: Number,
    required: false,
  },

  profile: {
    type: String,
    required: false,
  },
});


userSchema.pre("save" , async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password , this.password)
}


const User = mongoose.model("User", userSchema);

export default User;
