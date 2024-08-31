const express = require('express')
const app = express()
const path = require('path')
const port = 80

app.get('/' , (req , res) =>             

{
    res.sendFile(path.join(__dirname , 'index.html'))
})
app.get('/contact' , (req , res) =>             

    {
        res.sendFile(path.join(__dirname, 'contact.html'))
    })
 app.get('/services' , (req , res) =>             

    {
        res.sendFile(path.join(__dirname, 'services.html'))
    })
app.get('/doctors' , (req , res) =>            

    {
        res.sendFile(path.join(__dirname, 'doctors.html'))
    })
app.listen(port, () => {
    console.log('This is an Example of Hellow world in Express')

})
