from .manager import CWD
import os
import zipfile

# code from https://blog.csdn.net/weixin_44495599/article/details/115610823

def zipDir(dirpath, outFullName):
    """
    压缩指定文件夹
    :param dirpath: 目标文件夹路径
    :param outFullName: 压缩文件保存路径+xxxx.zip
    :return: 无
    """
    try:
        os.remove(outFullName)
    except Exception:
        pass
    
    zip = zipfile.ZipFile(outFullName, "w", zipfile.ZIP_DEFLATED)  # 创建zip文件

    walk = [i for i in os.walk(dirpath)]
    progress = 1
    progress_end = len(walk)

    for path, dirnames, filenames in walk:  # 遍历文件
        print(f'zipping: {progress} / {progress_end}')
        progress += 1
        fpath = path.replace(dirpath, "")  # 去掉目标跟路径，只对目标文件夹下边的文件及文件夹进行压缩（即生成相对路径）
        for filename in filenames:
            p = path.replace(CWD, '')[1:].replace('\\', '/')
            if outFullName == f'{p}/{filename}':
                continue
            zip.write(os.path.join(path, filename), os.path.join(fpath, filename))
    zip.close()

# code from https://blog.csdn.net/chichu261/article/details/106737620

def file2zip(zip_file_name: str, file_names: list):
    """ 将多个文件夹中文件压缩存储为zip
    
    :param zip_file_name:   /root/Document/test.zip
    :param file_names:      ['/root/user/doc/test.txt', ...]
    :return: 
    """
    # 读取写入方式 ZipFile requires mode 'r', 'w', 'x', or 'a'
    # 压缩方式  ZIP_STORED： 存储； ZIP_DEFLATED： 压缩存储
    with zipfile.ZipFile(zip_file_name, mode='w', compression=zipfile.ZIP_DEFLATED) as zf:
        for fn in file_names:
            parent_path, name = os.path.split(fn)
            
            # zipfile 内置提供的将文件压缩存储在.zip文件中， arcname即zip文件中存入文件的名称
            # 给予的归档名为 arcname (默认情况下将与 filename 一致，但是不带驱动器盘符并会移除开头的路径分隔符)
            zf.write(fn, arcname=name)
            
            # 等价于以下两行代码
            # 切换目录， 直接将文件写入。不切换目录，则会在压缩文件中创建文件的整个路径
            # os.chdir(parent_path)
            # zf.write(name)

def zip2file(zip_file_name: str, extract_path: str, members=None, pwd=None):
    """ 压缩文件内容提取值指定的文件夹

    :param zip_file_name: 待解压的文件  .zip          r'D:\Desktop\tst.zip'
    :param extract_path:  提取文件保存的目录           r'D:\Desktop\tst\test\test'
    :param members:       指定提取的文件，默认全部
    :param pwd:           解压文件的密码
    :return:
    """
    with zipfile.ZipFile(zip_file_name) as zf:
        zf.extractall(extract_path, members=members, pwd=pwd)

# if __name__ == "__main__":
# 	zip_name = '/root/Document/test.zip'
# 	files = ['/root/user/doc/test.txt', '/root/user/doc/test1.txt']
# 	file2zip(zip_name , files)
