export const getAllTasks = (req, res) => {
    res.status(200).send({task: "cứu tôi với"});
}

export const createTask = (req, res) => {
    res.status(201).json({message: "Tạo task thành công"});
}

export const updateTask = (req, res) => {
    const { id } = req.params;
    res.status(200).json({message: `Cập nhật task với id ${id} thành công`});
}

export const deleteTask = (req, res) => {
    const { id } = req.params;
    res.status(200).json({message: `Xóa task với id ${id} thành công`});
}