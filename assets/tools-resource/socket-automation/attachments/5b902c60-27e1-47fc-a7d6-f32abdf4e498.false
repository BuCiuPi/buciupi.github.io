import random
import maya.cmds as cmds
import maya.mel as mel
import os
import hashlib

def setup_accessory_socket():
    sk_joints = find_sk_joints()
    selected_sm_objects = cmds.textScrollList("smObjectsList", query=True, selectItem=True)

    for obj in selected_sm_objects:
        obj_split = obj.split('_')
        if len(obj_split) < 3:
            continue
        obj_third = obj_split[2]

        for sk_joint in sk_joints:
            sk_split = sk_joint.split('_')
            sk_second = sk_split[1]
            if obj_third == sk_second:
                try:
                    # Check if obj is already parented to sk_joint
                    current_parent = cmds.listRelatives(obj, parent=True, fullPath=False)
                    if not (current_parent and current_parent[0] == sk_joint):
                        cmds.parent(obj, sk_joint)
                    # Set the pivot of the object to the world position of the sk_joint
                    joint_pos = cmds.xform(sk_joint, query=True, worldSpace=True, translation=True)
                    cmds.xform(obj, worldSpace=True, pivots=joint_pos)
                    
                    # Freeze transforms (position, rotation) on the object
                    cmds.makeIdentity(obj, apply=True, translate=True, rotate=True, scale=False, normal=False)

                    print(f"Parented {obj} to {sk_joint}")
                except Exception as e:
                    print(f"Failed to parent {obj} to {sk_joint}: {e}")
                break
            
def unparent_sm_objects():
    selected_sm_objects = cmds.textScrollList("smObjectsList", query=True, selectItem=True)
    for obj in selected_sm_objects:
        # Check if object is already parented to world
        current_parent = cmds.listRelatives(obj, parent=True, fullPath=True)
        if current_parent is None:
            print(f"{obj} is already parented to world")
        else:
            cmds.parent(obj, world=True)
            print(f"Unparented {obj}")

def parent_selected_sm_objects_to_sk():
    """
    Parents the selected objects in the 'smObjectsList' UI list to their corresponding SK_ joint.
    """
    sk_joints = find_sk_joints()
    selected_sm_objects = cmds.textScrollList("smObjectsList", query=True, selectItem=True)

    if not selected_sm_objects:
        print("No SM_ objects selected.")
        return

    for obj in selected_sm_objects:
        obj_split = obj.split('_')
        if len(obj_split) < 3:
            print(f"Object name {obj} does not have enough parts to match SK_ joint.")
            continue
        obj_third = obj_split[2]

        matched_joint = None
        for sk_joint in sk_joints:
            sk_split = sk_joint.split('_')
            if len(sk_split) < 2:
                continue
            sk_second = sk_split[1]
            if obj_third == sk_second:
                matched_joint = sk_joint
                break

        if matched_joint:
            try:
                current_parent = cmds.listRelatives(obj, parent=True, fullPath=False)
                if not (current_parent and current_parent[0] == matched_joint):
                    cmds.parent(obj, matched_joint)
                print(f"Parented {obj} to {matched_joint}")
            except Exception as e:
                print(f"Failed to parent {obj} to {matched_joint}: {e}")
        else:
            print(f"No matching SK_ joint found for {obj}")

def orient_selected_sk_joints_by_world():
    """
    Sets the orientation of selected SK_ joints to match world orientation (zero out joint orientation).
    """
    selected_sk = cmds.textScrollList("skJointsList", query=True, selectItem=True)
    if not selected_sk:
        print("No joints selected.")
        return

    for joint in selected_sk:
        try:
            # Zero out jointOrient to align with world
            cmds.setAttr(f"{joint}.jointOrientX", 0)
            cmds.setAttr(f"{joint}.jointOrientY", 0)
            cmds.setAttr(f"{joint}.jointOrientZ", 0)
            print(f"Set world orientation for {joint}")
        except Exception as e:
            print(f"Failed to set orientation for {joint}: {e}")

def display_local_rotation_axes_for_selected_sk():
    """
    Turns on the display of local rotation axes for selected SK_ joints.
    """
    selected_sk = cmds.textScrollList("skJointsList", query=True, selectItem=True)
    if not selected_sk:
        print("No joints selected.")
        return

    for joint in selected_sk:
        try:
            # Toggle the displayLocalAxis attribute
            current_state = cmds.getAttr(f"{joint}.displayLocalAxis")
            new_state = not current_state
            cmds.setAttr(f"{joint}.displayLocalAxis", new_state)
            print(f"{'Enabled' if new_state else 'Disabled'} local rotation axes display for {joint}")
        except Exception as e:
            print(f"Failed to enable local rotation axes for {joint}: {e}")

def find_sk_joints():
    all_joints = cmds.ls(type='joint')
    sk_joints = [joint for joint in all_joints if joint.startswith('SK_')]
    return sk_joints


def find_sm_objects():
    # Get transform nodes whose names start with 'SM_' and that have a mesh shape child
    all_transforms = cmds.ls(type='transform')
    sm_objects = []
    for obj in all_transforms:
        if obj.startswith('SM_'):
            shapes = cmds.listRelatives(obj, shapes=True, fullPath=True) or []
            if any(cmds.nodeType(shape) == 'mesh' for shape in shapes):
                sm_objects.append(obj)
    return sm_objects


def find_sk_joints_with_info():
    sk_joints = find_sk_joints()
    joint_info = {}
    
    for joint in sk_joints:
        info = {
            'type': 'joint',
            'exists': cmds.objExists(joint),
            'parent': cmds.listRelatives(joint, parent=True, fullPath=True),
            'children': cmds.listRelatives(joint, children=True, fullPath=True),
            'world_position': cmds.xform(joint, query=True, worldSpace=True, translation=True),
            'rotation': cmds.xform(joint, query=True, worldSpace=True, rotation=True)
        }
        joint_info[joint] = info
    
    return joint_info


def select_sk_joints():

    selected_sk = cmds.textScrollList("skJointsList", query=True, selectItem=True)
    if selected_sk:
        cmds.select(selected_sk, replace=True)
        print(f"Selected {len(selected_sk)} SK_ joints: {selected_sk}")
    else:
        cmds.select(clear=True)
        print("No joints found with 'SK_' prefix")
    
    return selected_sk

def rename_sm_objects_by_sk():
    selected_sk = cmds.textScrollList("skJointsList", query=True, selectItem=True)
    
    if not selected_sk:
        cmds.warning("Please select a SK_ joint from the list first.")
        return
    
    selected_sk_joint = selected_sk[0]
    sk_split = selected_sk_joint.split('_')
    sk_second = sk_split[1]
    
    selected_sm_objects = cmds.textScrollList("smObjectsList", query=True, selectItem=True)
    renamed_count = 0
    new_names = []

    for obj in selected_sm_objects:
        obj_split = obj.split('_')
        new_name = f"SM_{obj_split[1]}_{sk_second}"
        try:
            new_obj_name = cmds.rename(obj, new_name)
            print(f"Renamed {obj} to {new_obj_name}")
            renamed_count += 1
            new_names.append(new_obj_name)
        except Exception as e:
            print(f"Failed to rename {obj}: {e}")
    
    if renamed_count > 0:
        print(f"Successfully renamed {renamed_count} SM_ objects using '{sk_second}' from {selected_sk_joint}")
        cmds.textScrollList("smObjectsList", edit=True, removeAll=True)
        updated_sm_objects = find_sm_objects()
        if updated_sm_objects:
            cmds.textScrollList("smObjectsList", edit=True, append=updated_sm_objects)
        # Reselect the newly renamed objects
        if new_names:
            cmds.textScrollList("smObjectsList", edit=True, deselectAll=True)
            cmds.textScrollList("smObjectsList", edit=True, selectItem=new_names)
            cmds.select(new_names, replace=True)
    else:
        cmds.warning("No SM_ objects were renamed.")

def select_sm_objects():
    selected_sm_objects = cmds.textScrollList("smObjectsList", query=True, selectItem=True)
    cmds.select(selected_sm_objects, replace=True)
    

def refresh_ui_lists():
    # Refresh both lists
    sk_joints = find_sk_joints()
    sm_objects = find_sm_objects()
    
    # Update SK_ joints list
    cmds.textScrollList("skJointsList", edit=True, removeAll=True)
    if sk_joints:
        cmds.textScrollList("skJointsList", edit=True, append=sk_joints)
    
    # Update SM_ objects list
    cmds.textScrollList("smObjectsList", edit=True, removeAll=True)
    if sm_objects:
        cmds.textScrollList("smObjectsList", edit=True, append=sm_objects)
    
    print(f"Refreshed: Found {len(sk_joints)} SK_ joints and {len(sm_objects)} SM_ objects")

def assign_material_with_random_color():
    select_sm_objects()
    selection = cmds.ls(selection=True, dag=True, type='mesh')
    
    if not selection: 
        cmds.confirmDialog(title='Error', message='No mesh selected.', button=['OK'], defaultButton='OK')
        return

    skipped = []

    for mesh in selection:
        transform = cmds.listRelatives(mesh, parent=True)[0]
        if not transform.startswith("SM_"):
            skipped.append(transform)
            continue

        mesh_name = transform.split('_')[1] # Remove 'SM_' prefix
        material_name = mesh_name

        if not cmds.objExists(material_name):
            shader = cmds.shadingNode('lambert', asShader=True, name=material_name)
            shading_group = cmds.sets(renderable=True, noSurfaceShader=True, empty=True, name=material_name + "SG")
            cmds.connectAttr(shader + ".outColor", shading_group + ".surfaceShader", force=True)

            # Assign a random color
            r, g, b = [random.uniform(0.2, 1.0) for _ in range(3)]
            cmds.setAttr(shader + ".color", r, g, b, type="double3")
        else:
            shading_group = material_name + "SG"

        cmds.sets(transform, edit=True, forceElement=shading_group)

    if skipped:
        msg = "These meshes were skipped (wrong naming):\n" + "\n".join(skipped)
        cmds.confirmDialog(title='Warning', message=msg, button=['OK'], defaultButton='OK')
        
def export_selected_meshes_individually(add_mesh_folder=True):
    meshes = cmds.ls(selection=True, type='transform')
    if not meshes:
        cmds.confirmDialog(title="Error", message="Please select one or more mesh objects", button=["OK"])
        return

    folder = cmds.fileDialog2(dialogStyle=2, fileMode=3, caption="Choose export folder")
    if not folder:
        return
    export_dir = folder[0]

    for mesh in meshes:
        if not cmds.listRelatives(mesh, shapes=True, type='mesh'):
            continue

        if add_mesh_folder:
            # Create a subfolder for each mesh
            mesh_folder = os.path.join(export_dir, mesh)
            if not os.path.exists(mesh_folder):
                os.makedirs(mesh_folder)
            export_path = os.path.join(mesh_folder, mesh + ".fbx").replace("\\", "/")
        else:
            export_path = os.path.join(export_dir, mesh + ".fbx").replace("\\", "/")

        cmds.select(mesh, replace=True)

        mel.eval('FBXExportSmoothingGroups -v true')
        mel.eval('FBXExportTangents -v true')
        mel.eval('FBXExportSmoothMesh -v true')
        mel.eval('FBXExportTriangulate -v false')

        mel.eval('FBXExport -f "{}" -s'.format(export_path))

    cmds.select(clear=True)
    cmds.confirmDialog(title="Done", message="Export completed", button=["OK"])

def show_sk_joints_ui():
    window_name = "skJointsFinderWin"
    if cmds.window(window_name, exists=True):
        cmds.deleteUI(window_name)
    
    sk_joints = find_sk_joints()
    sm_objects = find_sm_objects()
    joint_count = len(sk_joints)
    sm_count = len(sm_objects)

    def select_callback(*args):
        print("Selected SK_ joints")
        select_sk_joints()
    
    def setup_socket_callback(*args):
        print("Setup socket")
        setup_accessory_socket()
    
    def select_sm_callback(*args):
        print("Selected SM_ objects")
        select_sm_objects()
    
    def rename_sm_objects_callback(*args):
        print("Renamed SM_ objects")
        rename_sm_objects_by_sk()
    
    def refresh_ui_callback(*args):
        print("Refreshed UI lists")
        refresh_ui_lists()

    def unparent_sm_objects_callback(*args):
        print("Unparented SM_ objects")
        unparent_sm_objects()
    
    def parent_selected_sm_objects_to_sk_callback(*args):
        print("Parented SM_ objects to SK_")
        parent_selected_sm_objects_to_sk()
    
    def orient_selected_sk_joints_by_world_callback(*args):
        print("Oriented SK_ joints by world")
        orient_selected_sk_joints_by_world()
    
    def display_local_rotation_axes_for_selected_sk_callback(*args):
        print("Displayed local rotation axes for selected SK_")
        display_local_rotation_axes_for_selected_sk()
    
    def assign_material_with_random_color_callback(*args):
        print("Assigned material with random color to selected SM_")
        assign_material_with_random_color()
    
    def export_selected_meshes_individually_callback(*args):
        print("Exported selected meshes individually")
        add_mesh_folder = cmds.checkBox("addMeshFolderCheckbox", query=True, value=True)
        export_selected_meshes_individually(add_mesh_folder)
    
    window = cmds.window(window_name, title="Maya Joints & Objects Finder", sizeable=False)
    cmds.columnLayout(adjustableColumn=True, rowSpacing=8, columnAlign="center")
    
    cmds.button(label="Refresh", command=refresh_ui_callback)
    cmds.separator(height=8, style="in")
    
    # Create row layout for the two lists
    cmds.rowLayout(numberOfColumns=2, columnWidth2=(300, 300), adjustableColumn=2)
    
    # Left column - SK_ Joints
    cmds.columnLayout(adjustableColumn=True, rowSpacing=5)
    if sk_joints:
        cmds.text(label=f"Found {joint_count} joints with 'SK_' prefix:", align="left")
        cmds.textScrollList("skJointsList", numberOfRows=min(10, joint_count), allowMultiSelection=True, append=sk_joints, height=120)
    else:
        cmds.text(label="No joints found with 'SK_' prefix", align="center", height=40)

    select_sk_btn = cmds.button(label="Select SK_", command=select_callback, enable=True)
    orient_sk_btn = cmds.button(label="Orient SK_", command=orient_selected_sk_joints_by_world_callback, enable=True)
    display_axes_btn = cmds.button(label="Display Local Rotation Axes", command=display_local_rotation_axes_for_selected_sk_callback, enable=True)
    cmds.setParent("..")
    
    # Right column - SM_ Objects
    cmds.columnLayout(adjustableColumn=True, rowSpacing=5)
    if sm_objects:
        cmds.text(label=f"Found {sm_count} objects with 'SM_' prefix:", align="left")
        cmds.textScrollList("smObjectsList", numberOfRows=min(10, sm_count), allowMultiSelection=True, append=sm_objects, height=120)
    else:
        cmds.text(label="No objects found with 'SM_' prefix", align="center", height=40)
    select_sm_btn = cmds.button(label="Select SM_", command=select_sm_callback, enable=True)
    parent_sm_btn = cmds.button(label="Parent Selected SM_ to SK_", command=parent_selected_sm_objects_to_sk_callback, enable=True)
    unparent_sm_btn = cmds.button(label="Unparent Selected SM_", command=unparent_sm_objects_callback, enable=True)
    
    cmds.setParent("..")
    
    cmds.setParent("..")  # End row layout
    
    cmds.separator(height=8, style="in")
    cmds.rowLayout(numberOfColumns=1, adjustableColumn=1)
    rename_sm_btn = cmds.button(label="Rename SM_", command=rename_sm_objects_callback, enable=True)
    cmds.setParent("..")
    
    cmds.separator(height=8, style="in")
    cmds.rowLayout(numberOfColumns=1, adjustableColumn=1)
    setup_socket_btn = cmds.button(label="Setup Socket", command=setup_socket_callback, enable=True)
    cmds.setParent("..")

    cmds.separator(height=8, style="in")
    cmds.rowLayout(numberOfColumns=1, adjustableColumn=1)
    assign_material_btn = cmds.button(label="Assign Material with Random Color", command=assign_material_with_random_color_callback, enable=True)
    cmds.setParent("..")

    cmds.separator(height=8, style="in")
    cmds.rowLayout(numberOfColumns=2, adjustableColumn=1)
    export_meshes_btn = cmds.button(label="Export Selected Meshes Individually", command=export_selected_meshes_individually_callback, enable=True)
    cmds.checkBox("addMeshFolderCheckbox", label="Add Mesh Folder", value=True)
    cmds.setParent("..")

    # actual_password = [""]
    # def unlock_buttons(*args):
    #     # Get the current text and update our stored password
    #     current_text = cmds.textField("passwordField", query=True, text=True)
        
    #     # If the text is shorter than our stored password, user is deleting
    #     if len(current_text) < len(actual_password[0]):
    #         actual_password[0] = current_text
    #     else:
    #         # User is typing, add the new character to our stored password
    #         if len(current_text) > len(actual_password[0]):
    #             new_char = current_text[-1]  # Get the last character typed
    #             actual_password[0] += new_char
        
    #     # Display asterisks in the field
    #     display_length = len(actual_password[0])
    #     masked_text = "*" * display_length
    #     cmds.textField("passwordField", edit=True, text=masked_text)
        
    #     # Hash the entered password for comparison
    #     hashed_password = hashlib.sha256(actual_password[0].encode()).hexdigest()
    #     correct_hash = "03cc5600bba9bc82510cee7eb7498caceb141665018f0867946bb3914edd228f"
        
    #     if hashed_password == correct_hash:  # Compare hashed passwords
    #         # Enable buttons based on available data
    #         cmds.button(select_sk_btn, edit=True, enable=True)
    #         cmds.button(orient_sk_btn, edit=True, enable=True)
    #         cmds.button(display_axes_btn, edit=True, enable=True)
    #         cmds.button(setup_socket_btn, edit=True, enable=True)
    #         cmds.button(select_sm_btn, edit=True, enable=True)
    #         cmds.button(assign_material_btn, edit=True, enable=True)
    #         cmds.button(export_meshes_btn, edit=True, enable=True)
    #         cmds.button(parent_sm_btn, edit=True, enable=True)
    #         cmds.button(unparent_sm_btn, edit=True, enable=True)
    #         cmds.button(rename_sm_btn, edit=True, enable=True)
    #     else:
    #         # Disable all buttons if password is incorrect
    #         cmds.button(select_sk_btn, edit=True, enable=False)
    #         cmds.button(orient_sk_btn, edit=True, enable=False)
    #         cmds.button(display_axes_btn, edit=True, enable=False)
    #         cmds.button(setup_socket_btn, edit=True, enable=False)
    #         cmds.button(select_sm_btn, edit=True, enable=False)
    #         cmds.button(assign_material_btn, edit=True, enable=False)
    #         cmds.button(export_meshes_btn, edit=True, enable=False)
    #         cmds.button(parent_sm_btn, edit=True, enable=False)
    #         cmds.button(unparent_sm_btn, edit=True, enable=False)
    #         cmds.button(rename_sm_btn, edit=True, enable=False)

    # cmds.separator(height=8, style="in")
    # cmds.rowLayout(numberOfColumns=2, adjustableColumn=2)
    # cmds.text(label="Password:")
    # cmds.textField("passwordField", text="", textChangedCommand=unlock_buttons)
    # cmds.setParent("..")

    # unlock_buttons()

    cmds.showWindow(window)

if __name__ == "__main__":
    show_sk_joints_ui()